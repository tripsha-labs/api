/**
 * @name - Booking contoller
 * @description - This will handle business logic for Booking module
 */
import { dbConnect } from '../../utils';
import { BookingModel, UserModel } from '../../models';

export class BookingController {
  static async createBooking(params) {
    await dbConnect();
    const user = UserModel.get({ awsUserId: params.guestAwsId });
    if (!user || !user._id) throw new Error('User not found.');
    params.guestId = user._id.toString();
    delete params.guestAwsId;
    const booking = await BookingModel.create(params);
    return booking;
  }

  static async listGuestBookings(guestAwsId) {
    await dbConnect();
    const user = UserModel.get({ awsUserId: guestAwsId });
    if (!user || !user._id) throw new Error('User not found.');
    const bookings = await BookingModel.list({ guestId: user._id.toString() });
    return bookings;
  }

  static async listHostBookings(hostAwsId) {
    await dbConnect();
    const user = UserModel.get({ awsUserId: hostAwsId });
    if (!user || !user._id) throw new Error('User not found.');
    // Find `trips` hosted by `user._id`
    // Return bookings where tripId is in `trips`
    return [];
  }

  static async updateBooking(id, params) {
    await dbConnect();
    await BookingModel.update(id, params);
    return 'success';
  }
}
