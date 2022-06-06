/**
 * @name - Payment model
 * @description - This is the Payment model. All db operations related to payments are performed from here.
 */
import { Payment } from './';

export class PaymentModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const payments = Payment.find(filter, select || {});
    if (sort) payments.sort(sort);
    if (pagination) {
      payments.limit(pagination.limit);
      payments.skip(pagination.skip);
    }
    return payments;
  }

  static count(params = {}) {
    return Payment.countDocuments(params);
  }

  static create(params = {}) {
    const payment = new Payment(params);
    return payment.save();
  }

  static update(id, params = {}) {
    return Payment.updateOne({ _id: id }, { $set: params });
  }

  static updateMany(filter, params) {
    return Payment.updateMany(filter, { $set: params });
  }

  static aggregate(params = {}) {
    return Payment.aggregate(params);
  }

  static delete(params = {}) {
    return Payment.deleteOne(params);
  }

  static getById(id) {
    return Payment.findById(id);
  }

  static get(params) {
    return Payment.findOne(params);
  }
  static addOrUpdate(filter, update) {
    return Payment.updateMany(filter, { $set: update }, { upsert: true });
  }
  static deleteMany(filter) {
    return Payment.deleteMany(filter);
  }
}
