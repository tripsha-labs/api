/**
 * @name - Payment controller
 * @description - This will handle business logic for Payment module
 */
import { Types } from 'mongoose';
import { PaymentModel, UserModel, TripModel } from '../../models';
import { ERROR_KEYS } from '../../constants';

export class PaymentController {
  static async createPayment(params, awsUserId) {
    const paymentData = params;
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    paymentData['createdBy'] = user._id.toString();
    paymentData['updatedBy'] = user._id.toString();
    return await PaymentModel.create(paymentData);
  }

  static async listPayments(filters, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!filters.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const trip = await TripModel.getById(filters.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const coHosts = trip?.coHosts?.map(h => h.id);
    if (
      !(
        user.isAdmin ||
        coHosts?.includes(user._id.toString()) ||
        trip.ownerId.toString() === user._id.toString()
      )
    ) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    return await PaymentModel.list({
      filter: {
        tripId: filters.tripId,
      },
    });
  }

  static async getPayment(paymentId) {
    return await PaymentModel.getById(paymentId);
  }

  static async updatePayment(id, params) {
    await PaymentModel.update(id, params);
    return 'success';
  }

  static async multiUpdatePayment(paymentIds, payment) {
    const payment_ids = paymentIds.map(id => Types.ObjectId(id));
    await PaymentModel.updateMany({ _id: { $in: payment_ids } }, payment);
    return 'success';
  }

  static async deletePayment(paymentIds) {
    const payment_ids = paymentIds.map(id => Types.ObjectId(id));
    await PaymentModel.deleteMany({ _id: { $in: payment_ids } });
    return 'success';
  }
}
