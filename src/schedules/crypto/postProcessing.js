import { BookingModel } from '../../models';
import { WalletController } from '../../routes/crypto/controllers/wallet.ctrl';
import { Notifier } from './Notifier';

const PAY_FAIL_OUTCOME = 'payment_charged';
const PAY_SUCCESS_OUTCOME = 'payment_charged';
const NOTIFY_HOST_CHARGE_COMPLETE = 'payment_charged_success_host';
const NOTIFY_TRAVELER_CHARGE_COMPLETE = 'payment_charged_success_traveler';
const NOTIFY_TRAVELER_CHARGE_FAIL = 'payment_charged_failure_traveler';

/**
 * Set of functions to handle post-transfer processing for different scenarios.
 */

export const insufficientFunds = async props => {
  console.log('Attendee has insufficient funds');
  const { booking, trip } = props;
  //booking needs to be marked as declined with a reason
  /**
   * NOTE: I don't know if this is the right thing to do but setting to 'paymentPending' again
   * seems like it will just keep failing until the user tries again. And as far as I could tell
   * on the UI, once I paid, I could not pay again or replace payment information. Will need to
   * experiment with this to find a better solution.
   */
  /**
   * From Cassie, booking status should be 'pendingPayment' and note to traveler to
   * add more funds ot wallet. When crypto cycle runs again, it will try again.
   */
  //booking.status = 'declined';
  /*
    Notifier.notifyTraveler({
        //need custom message about funding insufficient
    });
    */
  booking.reason = 'Insufficient token funds to pay for event';
  await BookingModel.update(booking._id, booking);

  /**
   * NOTE: It would be nice to have an insufficient-funds specific message to pass
   * along so the traveler knows their wallet needs more funds for payment.
   */
  await Notifier.notifyTraveler({
    booking,
    trip,
    chargeOutcome: PAY_FAIL_OUTCOME,
    notificationType: NOTIFY_TRAVELER_CHARGE_FAIL,
  });
};

/**
 * Used when the signature for a traveler is no longer valid or perhaps their spend allowance
 * to Permit2 is no longer valid. Either way, the payment cannot be made using the current
 * signature and it must be redone.
 */
export const invalidSignature = async props => {
  const { booking, trip } = props;
  console.log('Attendee provided invalid signature');
  /**
   * NOTE: Just like above, I think this is the right thing to do because we cannot
   * retry the payment signature knowing it will fail. The user has to resubmit.
   */
  booking.status = 'declined';
  booking.reason = 'Invalid or expired payment approval signature';
  await BookingModel.update(booking._id, booking);

  /**
   * NOTE: It would be nice to have a spend-allowance / signature specific error message
   * to send the user.
   */
  await Notifier.notifyTraveler({
    booking,
    trip,
    chargeOutcome: PAY_FAIL_OUTCOME,
    notificationType: NOTIFY_TRAVELER_CHARGE_FAIL,
  });
};

/**
 * Store interim information about the tripsha part of the payment flow. This is to make
 * sure we don't double-charge the traveler.
 */
export const storeTripshaTransfer = async props => {
  const { booking, txn, receipt } = props;
  const details = booking.cryptoPaymentMethod;

  booking.cryptoPaymentMethod.tripshaTransferComplete = true;

  //store transaction details in case we need them later.
  const xferGasFees = txn.maxPriorityFeePerGas
    ? {
        maxPriorityFeePerGas: txn.maxPriorityFeePerGas.toString(),
        maxFeePerGas: txn.maxFeePerGas.toString(),
      }
    : txn.gasPrice.toString();

  booking.cryptoPaymentMethod.tripshaTransferTxnDetails = {
    hash: txn.hash,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: xferGasFees,
  };
  console.log('Interrim storage for booking', booking);
  await BookingModel.update(booking._id, booking);

  //mark the nonce as used for wallet and token. NOTE: this does NOT prevent nonce reuse
  //since this is only being updated AFTER payment is complete. Reserving and using nonces
  //is a more complicated flow but would guarantee unique nonces. This is only an issue if
  //travelers can book multiple trips with crypto for the same token and network
  //before being accepted by a host.
  await WalletController.increaseNonce({
    chainId: details.chainId,
    address: details.wallet,
    nonce: +details.nonce,
    token: details.token,
  });
};

/**
 * Called when payment is successful.
 */
export const successfulPayment = async props => {
  const { booking, trip, results } = props;

  /**
   * Store payment intent as transaction details. Not sure yet how these
   * will be displayed on the UI side.
   */
  const { tripshaTransferResult, tokenTransferResult } = results;
  let { txn: xferTxn, receipt: xferReceipt } = tripshaTransferResult;
  let { txn: tokenTxn, receipt: tokenReceipt } = tokenTransferResult;

  const xferGasFees = xferTxn.maxPriorityFeePerGas
    ? {
        maxPriorityFeePerGas: xferTxn.maxPriorityFeePerGas.toString(),
        maxFeePerGas: xferTxn.maxFeePerGas.toString(),
      }
    : xferTxn.gasPrice.toString();
  const tokenGasFees = tokenTxn.maxPriorityFeePerGas
    ? {
        maxPriorityFeePerGas: tokenTxn.maxPriorityFeePerGas.toString(),
        maxFeePerGas: tokenTxn.maxFeePerGas.toString(),
      }
    : tokenTxn.gasPrice.toString();

  booking.paymentHistory.push({
    amount: booking.currentDue,
    paymentMethod: booking.cryptoPaymentMethod,
    currency: booking.currency,
    paymentIntent: {
      status: xferReceipt.status && Boolean,
      tripshaTransfer: {
        txnHash: xferTxn.hash,
        gasUsed: xferReceipt.gasUsed.toString(),
        gasPrice: xferGasFees,
      },
      tokenTransfer: {
        txnHash: tokenTxn.hash,
        gasUsed: tokenReceipt.gasUsed.toString(),
        gasPrice: tokenGasFees,
      },
    },
  });
  //set back to approved for display purposes
  booking.status = 'approved';
  //reset what's and what's due
  booking.paidAmount = booking.currentDue;
  booking.currentDue = 0;

  console.log('Saving booking', booking);

  await BookingModel.update(booking._id, booking);

  //let the traveler know they're booked
  await Notifier.notifyTraveler({
    booking,
    trip,
    chargeOutcome: PAY_SUCCESS_OUTCOME,
    notificationType: NOTIFY_TRAVELER_CHARGE_COMPLETE,
  });

  //let the host know payment was successful
  await Notifier.notifyHost({
    booking,
    trip,
    chargeOutcome: PAY_SUCCESS_OUTCOME,
    notificationType: NOTIFY_HOST_CHARGE_COMPLETE,
  });
};

/**
 * Called when some part of crypto payment failed
 */
export const paymentFailed = async props => {
  const { booking, err, trip, results } = props;
  console.log('Payment failed due to', err.reason || err.message);

  /**
   * Even with a failure, we want to capture the failed transaction details. This is
   * useful when wanting to compute how much Tripsha spends on failed transaction fees, etc.
   * And maybe to show the traveler how many transactions it took to get their payment to go
   * through.
   */
  const { tripshaTransferResult, tokenTransferResult } = results ? results : {};

  let { txn: xferTxn, receipt: xferReceipt } = tripshaTransferResult
    ? tripshaTransferResult
    : {};
  let { txn: tokenTxn, receipt: tokenReceipt } = tokenTransferResult
    ? tokenTransferResult
    : {};

  const xferGasFees = xferTxn?.maxPriorityFeePerGas
    ? {
        maxPriorityFeePerGas: xferTxn.maxPriorityFeePerGas.toString(),
        maxFeePerGas: xferTxn.maxFeePerGas.toString(),
      }
    : xferTxn?.gasPrice.toString();
  const tokenGasFees = tokenTxn?.maxPriorityFeePerGas
    ? {
        maxPriorityFeePerGas: tokenTxn.maxPriorityFeePerGas.toString(),
        maxFeePerGas: tokenTxn.maxFeePerGas.toString(),
      }
    : tokenTxn?.gasPrice.toString();

  booking.paymentRetryCount = (booking.paymentRetryCount || 0) + 1;
  if (booking.paymentRetryCount >= 3) {
    //if we've tried 3 times and failed, we decline the payment and give up.
    console.log('Declining payment after too many failures');
    booking.status = 'declined';
    booking.reason = err.reason || err.message;
  } else {
    booking.status = 'paymentPending'; //try again
    if (xferTxn) {
      booking.paymentHistory.push({
        amount: booking.currentDue,
        paymentMethod: booking.cryptoPaymentMethod,
        currency: booking.currency,
        paymentIntent: {
          status: xferReceipt.status && Boolean,
          tripshaTransfer: {
            txnHash: xferTxn.hash,
            gasUsed: xferReceipt.gasUsed.toString(),
            gasPrice: xferGasFees,
          },
          tokenTransfer: {
            txnHash: tokenTxn.hash,
            gasUsed: tokenReceipt.gasUsed.toString(),
            gasPrice: tokenGasFees,
          },
        },
      });
    }

    /**
     * Notify the traveler that something went wrong.
     */
    await Notifier.notifyTraveler({
      booking,
      trip,
      chargeOutcome: PAY_FAIL_OUTCOME,
      notificationType: NOTIFY_TRAVELER_CHARGE_FAIL,
    });
  }
  await BookingModel.update(booking._id, booking);
};
