/**
 * @name - Booking contoller
 * @description - This will handle business logic for Booking module
 */
import { dbConnect } from '../../utils';
import {
  getCosting,
  getBookingValidity,
  getDepositStatus,
  getDiscountStatus,
} from '../../helpers';

import { BookingModel, UserModel, TripModel } from '../../models';
import { ERROR_KEYS } from '../../constants';

export class BookingController {
  static async createBooking(params, awsUserId) {
    await dbConnect();
    const bookingData = { ...params };
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (bookingData.attendees > trip.spotsAvailable)
      throw ERROR_KEYS.TRIP_IS_FULL;

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const tripOwner = await UserModel.get({ _id: trip.ownerId });
    if (!tripOwner) throw ERROR_KEYS.USER_NOT_FOUND;

    bookingData['memberId'] = user._id.toString();
    bookingData['ownerId'] = tripOwner._id.toString();
    bookingData['onwerStripeId'] = tripOwner.stripeAccountId;
    bookingData['memberStripeId'] = user.stripeCustomerId;
    // Payment validation and calculation
    bookingData['isDiscountApplicable'] = getDiscountStatus(trip);
    bookingData['isDepositApplicable'] = getDepositStatus(trip);
    if (!getBookingValidity(trip)) throw ERROR_KEYS.TRIP_BOOKING_CLOSED;
    const costing = getCosting(bookingData);
    const finalBookingData = { ...bookingData, ...costing };
    const booking = await BookingModel.create(finalBookingData);
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
