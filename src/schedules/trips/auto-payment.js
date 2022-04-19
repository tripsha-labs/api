import moment from 'moment';
import { ObjectID } from 'mongodb';
import { dbConnect, logActivity, StripeAPI } from '../../utils';
import { LogMessages } from '../../constants';
import { TripModel, BookingModel, UserModel } from '../../models';
const applyCharge = booking => {
  return new Promise(async resolve => {
    try {
      const trip = await TripModel.getById(booking.tripId);
      if (trip) {
        const ownerInfo = await UserModel.get({
          _id: trip.ownerId,
        });
        const memberInfo = await UserModel.get({
          _id: ObjectID(booking.memberId),
        });
        if (ownerInfo && memberInfo) {
          try {
            const paymentIntent = await StripeAPI.createPaymentIntent({
              amount: parseInt(booking.currentDue * 100),
              currency: booking.currency,
              customerId: booking.memberStripeId,
              paymentMethod: booking.stripePaymentMethod.id,
              confirm: true,
              beneficiary: booking.onwerStripeId,
              hostShare: ownerInfo.hostShare,
            });
            if (paymentIntent) {
              booking.paymentHistory.push({
                amount: booking.currentDue,
                paymentMethod: booking.stripePaymentMethod,
                currency: booking.currency,
                paymentIntent: paymentIntent,
              });
              const bookingUpdate = {
                paymentHistory: booking.paymentHistory,
              };

              bookingUpdate['paidAmout'] =
                booking.paidAmout + booking.currentDue;
              bookingUpdate['pendingAmount'] = 0;
              bookingUpdate['currentDue'] = 0;
              bookingUpdate['paymentStatus'] = 'full';
              await BookingModel.update(booking._id, bookingUpdate);
              await logActivity({
                ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_HOST(
                  `${memberInfo.firstName} ${memberInfo.lastName}`,
                  trip['title']
                ),
                tripId: trip._id.toString(),
                audienceIds: [ownerInfo._id.toString()],
                userId: memberInfo._id.toString(),
              });
              await logActivity({
                ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_TRAVELER(
                  trip['title']
                ),
                tripId: trip._id.toString(),
                audienceIds: [memberInfo._id.toString()],
                userId: memberInfo._id.toString(),
              });
            }
          } catch (err) {
            console.log(err);
            if (err.type === 'StripeCardError') {
              const paymentError = {
                type: err.type,
                message: err.message,
              };
              const bookingUpdate = {
                paymentRetryCount: (booking.paymentRetryCount || 0) + 1,
                paymentError: paymentError,
              };
              await BookingModel.update(booking._id, bookingUpdate);
              await logActivity({
                ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_TRAVELER(
                  trip['title']
                ),
                tripId: trip._id.toString(),
                audienceIds: [memberInfo._id.toString()],
                userId: memberInfo._id.toString(),
              });
            }
          }
        } else {
          console.log('Trip owner not found');
        }
      } else {
        console.log('Trip not found');
      }
    } catch (err) {
      console.log(err);
    }
    return resolve();
  });
};
const chargePayment = async () => {
  try {
    const bookings = await BookingModel.list({
      filter: {
        autoChargeDate: {
          $lt: moment().unix(),
        },
        status: 'approved',
        paymentRetryCount: { $lt: 7 },
        currentDue: {
          $gt: 0,
        },
      },
      limit: 100,
    });
    const promises = [];
    bookings.map(booking => {
      promises.push(applyCharge(booking));
      return booking;
    });
    await Promise.all(promises);
    if (bookings.length == 100) {
      chargePayment();
    }
  } catch (err) {
    console.log(err);
  }
};
export const autoPayment = async (event, context) => {
  try {
    await dbConnect();
    await chargePayment();
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
