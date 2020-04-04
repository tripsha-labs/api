/**
 * @name - Booking contoller
 * @description - This will handle business logic for Booking module
 */
import { dbConnect } from '../../utils';
import { BookingModel, UserModel } from '../../models';
import { ERROR_KEYS } from '../../constants';

export class BookingController {
  static async createBooking(params) {
    await dbConnect();
    const booking = await BookingModel.create(params);
    return booking;
  }

  static async listGuestBookings(guestAwsId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: guestAwsId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const bookings = await BookingModel.list({ guestId: user._id.toString() });
    return bookings;
  }

  static async listHostBookings(tripId) {
    await dbConnect();
    const bookings = await BookingModel.list({ tripId });
    return bookings;
  }

  static async updateBooking(id, params) {
    await dbConnect();
    await BookingModel.update(id, params);
    return 'success';
  }
}
