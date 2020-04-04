/**
 * @name - Booking model
 * @description - This is booking model, where all db opeartion related to booking, performed from here
 */
import { Booking } from './';

export class BookingModel {
  static list(params = {}) {
    const bookings = Booking.find(params);
    return bookings;
  }

  static count(params = {}) {
    return Booking.countDocuments(params);
  }

  static create(params = {}) {
    const booking = new Booking(params);
    return booking.save();
  }

  static update(id, params = {}) {
    return Booking.updateOne({ _id: id }, { $set: params });
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
}
