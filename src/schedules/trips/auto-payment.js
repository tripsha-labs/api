import moment from 'moment';
import { ObjectID } from 'mongodb';
import { dbConnect, logActivity, StripeAPI } from '../../utils';
import { LogMessages } from '../../constants';
import {
  TripModel,
  BookingModel,
  UserModel,
  InvoiceModel,
  InvoiceItemModel,
} from '../../models';
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
              // await logActivity({
              //   ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_HOST(
              //     `${memberInfo.firstName} ${memberInfo.lastName}`,
              //     trip['title']
              //   ),
              //   tripId: trip._id.toString(),
              //   audienceIds: [ownerInfo._id.toString()],
              //   userId: memberInfo._id.toString(),
              // });
              // await logActivity({
              //   ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_TRAVELER(
              //     trip['title']
              //   ),
              //   tripId: trip._id.toString(),
              //   audienceIds: [memberInfo._id.toString()],
              //   userId: memberInfo._id.toString(),
              // });
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
              // await logActivity({
              //   ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_TRAVELER(
              //     trip['title']
              //   ),
              //   tripId: trip._id.toString(),
              //   audienceIds: [memberInfo._id.toString()],
              //   userId: memberInfo._id.toString(),
              // });
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
        isAutoPayEnabled: true,
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

export const generateInvoice = async (event, context) => {
  try {
    if (moment().date() <= 3) {
      await dbConnect();
      const invoices = await InvoiceModel.find({
        status: 'draft',
        createdAt: {
          $lte: new Date(
            moment()
              .endOf('month')
              .subtract(1, 'months')
              .format()
          ),
        },
      });

      const promises = invoices.map(invoice => {
        return new Promise(async resolve => {
          const user = await UserModel.get({ _id: invoice.userId });
          const billings = await InvoiceItemModel.aggregate([
            {
              $match: {
                invoiceId: invoice._id,
              },
            },
            {
              $group: {
                _id: '$tripOwnerId',
                records: { $push: '$$ROOT' },
                guestCount: { $sum: '$guestCount' },
                travelerCount: { $sum: '$travelerCount' },
              },
            },
          ]);
          console.log('Found billing entries: ', billings.length);
          if (billings.length > 0) {
            let guests = 0;
            let travelers = 0;
            billings.forEach(b => {
              guests += b.guestCount;
              travelers += b.travelerCount;
            });
            const totalUnits = travelers + guests;
            const unitCost = 2.5;
            await InvoiceModel.updateOne(
              { _id: invoice._id },
              {
                $set: {
                  totalUnits,
                  travelers,
                  guests,
                  status: 'pending',
                  unitCost: unitCost,
                  amount: totalUnits * unitCost,
                  customerId: user?.stripeCustomerId,
                  paymentMethodId: user?.paymentMethod,
                },
              }
            );
          }
          return resolve();
        });
      });
      await Promise.all(promises);
    }
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
const chargeInvoice = async counter => {
  try {
    const invoices = await InvoiceModel.find({
      status: 'pending',
    }).limit(50);
    if (invoices.length > 0) {
      const promises = invoices.map(invoice => {
        return new Promise(async resolve => {
          try {
            const user = await UserModel.get(
              { _id: invoice.userId },
              { isConcierge: 1 }
            );
            const isConcierge = user && user.hasOwnProperty('isConcierge');
            let paymentIntent = null;
            if (!isConcierge) {
              paymentIntent = await StripeAPI.createPaymentIntent({
                amount: parseInt(invoice.amount * 100),
                currency: invoice.currency,
                customerId: invoice.customerId,
                paymentMethod: invoice.paymentMethodId,
                confirm: true,
              });
            }
            if (paymentIntent && !isConcierge) {
              await InvoiceModel.updateOne(
                { _id: invoice._id },
                {
                  $set: {
                    status: 'paid',
                    paymentDate: moment().unix(),
                    paymentIntentId: paymentIntent.id,
                  },
                }
              );
            } else {
              await InvoiceModel.updateOne(
                { _id: invoice._id },
                {
                  $set: {
                    status: 'paid',
                    paymentDate: moment().unix(),
                    isWaivedOff: true,
                  },
                }
              );
            }
          } catch (err) {
            if (err.type === 'StripeCardError') {
              const paymentError = {
                type: err.type,
                message: err.message,
              };
              const invoiceUpdate = {
                paymentRetryCount: (invoice.paymentRetryCount || 0) + 1,
                paymentError: paymentError,
              };
              await InvoiceModel.updateOne(
                { _id: invoice._id },
                { $set: invoiceUpdate }
              );
            }
            console.log(err);
          }
          return resolve();
        });
      });
      await Promise.all(promises);
      if (invoices.length == 50) await chargeInvoice(0);
    }
  } catch (err) {
    console.log(err);
    if (counter < 3) await chargeInvoice(counter + 1);
  }
};
export const chargeInvoicePayment = async (event, context) => {
  try {
    if ([1, 4, 7].includes(moment().date())) {
      console.log('Charge invoice payment');
      await dbConnect();
      await chargeInvoice(0);
    }
    return context.logStreamName;
  } catch (err) {
    console.log(err);
  }
};
