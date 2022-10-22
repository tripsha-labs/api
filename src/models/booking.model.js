/**
 * @name - Booking model
 * @description - This is the Booking model. All db operations related to bookings are performed from here.
 */
import { Booking } from './';

export class BookingModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const bookings = Booking.find(filter, select || {});
    if (sort) bookings.sort(sort);
    if (pagination) {
      bookings.limit(pagination.limit);
      bookings.skip(pagination.skip);
    }
    return bookings;
  }

  static count(params = {}) {
    return Booking.countDocuments(params);
  }

  static create(params = {}) {
    const booking = new Booking(params);
    return booking.save();
  }

  static update(id, params = {}, upsert = {}) {
    return Booking.updateOne({ _id: id }, { $set: params }, upsert);
  }

  static updateQuery(query, params = {}, upsert = {}) {
    return Booking.updateOne(query, { $set: params }, upsert);
  }

  static updateMany(filter, params) {
    return Booking.updateMany(filter, { $set: params });
  }

  static updateUnsetMany(filter, params) {
    return Booking.updateMany(filter, { $unset: params });
  }

  static aggregate(params = {}) {
    return Booking.aggregate(params);
  }

  static delete(params = {}) {
    return Booking.deleteOne(params);
  }

  static getById(id) {
    return Booking.findById(id);
  }

  static get(params) {
    return Booking.findOne(params);
  }
  static addOrUpdate(filter, update) {
    return Booking.updateMany(filter, { $set: update }, { upsert: true });
  }
  static bulkWrite(params) {
    return Booking.bulkWrite(params);
  }
}
