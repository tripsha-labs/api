import { BookingModel, TripModel } from '../../models';
import { dbConnect } from '../../utils';
import { PaymentExecution } from './PaymentExecution';
import {
  insufficientFunds,
  invalidSignature,
  paymentFailed,
  storeTripshaTransfer,
  successfulPayment,
} from './postProcessing';

var Mutex = require('async-mutex').Mutex;
const mutex = new Mutex();

const BOOKING_LIMIT = 50;

/**
 * Charge crypto-based bookings. This design is simplistic and could use some improvement. But
 * because of the complexities of managing synchronized blockchain state, we need a single funnel
 * to process payments through a single wallet.
 *
 * Blockchain networks require the submitting wallet to use a unique 'nonce' with each transaction.
 * If concurrent charges were allowed, that nonce would likely be re-used across threads causing
 * blockchain endpoints to reject transactions, or worse, overwrite them! When submitting transactions
 * with the same nonce, the network believes you are attempting to replace the transaction and will
 * simply take your latest transaction, so long as the fee is at least 10% higher than the last transaction.
 * We want to avoid all of this confusion by having a single process handle all transactions.
 *
 * This implementation also tried to first use Multicall to compact the two required transfers for
 * each payment (one from attendee -> Tripsha; and second from Tripsha -> host). That failed because
 * the state changes are not taken into account when testing transactions for failure prior to submitting
 * on-chain. We could bypass this initial test; but we would be at risk of paying failed txn fees
 * over and over if something really is wrong with the transaction.
 *
 * The end result is a slow payment processor that takes each payment in series and tries to execute.
 */
export const chargeWallets = async () => {
  await dbConnect();
  /**
   * Impotant that we do not execute on-chain transactions concurrently. We use a mutex lock here
   * to make sure we don't get called concurrently
   */
  const release = await mutex.acquire();
  try {
    //keep processing bookings until we've processed all available
    while (true) {
      let bookings = await getBookings();
      await chargeBookings(bookings);
      //WARN: if there are > LIMIT bookings it could take a long time to process payments.
      //In addition, if all fail, this will be in an infinite loop until payments start
      //to settle and bookings are approved/declined in the DB.
      if (bookings.length < BOOKING_LIMIT) {
        break;
      }
    }
  } finally {
    await release();
  }
};

/**
 * Get all crypto bookings that have not been paid yet
 *
 * @returns array of bookings
 */
const getBookings = async () => {
  console.log('Getting crypto bookings...');
  return await BookingModel.list({
    filter: {
      //special status for crypto pending payments
      status: 'paymentPending',

      //make we only grab those that have crypto details
      cryptoPaymentMethod: {
        $exists: true,
      },

      //and haven't been retried too many times
      paymentRetryCount: { $lt: 3 },

      //and actually have a payment due
      currentDue: {
        $gt: 0,
      },
    },
    limit: BOOKING_LIMIT,
  });
};

/**
 * Charge all bookings that are ready for payment
 *
 * @param {*} bookings
 */
const chargeBookings = async bookings => {
  console.log('Charging', bookings.length, 'bookings');

  for (let i = 0; i < bookings.length; ++i) {
    const book = bookings[i];
    const trip = await TripModel.getById(book.tripId);
    if (!trip) {
      console.warn('Could not find trip with id: ' + book.tripId);
      continue;
    }

    //create a new payment execution
    const payment = new PaymentExecution({
      booking: book,
      trip,
    });

    //make sure traveler still has funds to spend
    console.log('Checking if attendee has funds');
    if (!(await payment.attendeeHasFunds())) {
      await insufficientFunds({ booking: book, trip });
      continue;
    }

    //and that the signature/allowance still works
    console.log('Checking if attendee signature is still valid');
    if (!(await payment.signatureValid())) {
      await invalidSignature({ booking: book, trip });
      continue;
    }

    console.log('Executing payment');

    try {
      //try to make transfers
      const r = await payment.execute();

      //if the tripsha transfer went through, make sure we persist that
      //so we don't try to double charge
      if (r.tripshaTransferResult) {
        await storeTripshaTransfer({
          booking: book,
          txn: r.tripshaTransferResult.txn,
          receipt: r.tripshaTransferResult.receipt,
        });
      }

      //if the tripsha transfer failed, nothing else should have been
      //executed
      if (r.tripshaTransferError) {
        console.log('Tripsha transfer failed', r.tripshaTransferError);
        await paymentFailed({
          booking: book,
          trip,
          err: r.tripshaTransferError,
          results: r,
        });
        //otherwise if the token transfer failed, we may have performed
        //tripsha part only and then something went wrong. Record that failure
        //for next attempt.
      } else if (r.tokenTransferError) {
        console.log('Token transfer failed', r.tokenTransferError);
        await paymentFailed({
          booking: book,
          trip,
          err: r.tokenTransferError,
          results: r,
        });
      } else {
        console.log('All transfers succeeded');
        await successfulPayment({ booking: book, trip, results: r });
      }
    } catch (e) {
      console.log('Payment failed', e);
      await paymentFailed({ booking: book, trip, err: e });
    }
  }
};
