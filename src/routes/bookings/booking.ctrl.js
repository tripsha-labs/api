/**
 * @name - Booking contoller
 * @description - This will handle business logic for Booking module
 */
import { dbConnect, StripeAPI } from '../../utils';

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
    const spotsReserved = trip.spotsReserved + bookingData.attendees;
    const spotsFilled = trip.spotsFilled + spotsReserved;
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (
      bookingData.attendees > trip.spotsAvailable &&
      spotsFilled > trip.spotsAvailable
    )
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
    const tripUpdate = {
      spotsReserved: spotsReserved,
      isLocked: true,
    };
    if (bookingData.room) {
      tripUpdate['rooms'] = [];
      trip.rooms.forEach(room => {
        if (room.id == bookingData.room.id) {
          const filledCount = room['filled']
            ? room['filled'] + bookingData.attendees
            : bookingData.attendees;
          if (filledCount > room['available']) {
            throw ERROR_KEYS.TRIP_RESOURCES_FULL;
          }
          room['filled'] = filledCount;
        }
        tripUpdate['rooms'].push(room);
      });
    }
    if (bookingData.addOns && bookingData.addOns.length > 0) {
      tripUpdate['addOns'] = [];
      trip.addOns.forEach(addOn => {
        const bAddon = bookingData.addOns.find(
          bAddOn => bAddOn.id === addOn.id
        );
        if (bAddon) {
          const filledCount = addOn['filled']
            ? addOn['filled'] + bAddon.attendees
            : bAddon.attendees;
          if (filledCount > addOn['available']) {
            throw ERROR_KEYS.TRIP_RESOURCES_FULL;
          }
          addOn['filled'] = filledCount;
        }
        tripUpdate['addOns'].push(addOn);
      });
    }
    const booking = await BookingModel.create(finalBookingData);
    await TripModel.update(trip._id, tripUpdate);
    return booking;
  }

  static async listBookings(params, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (!(user.isAdmin || trip.ownerId === user._id)) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const bookingList = BookingModel.list({ tripId: params.tripId });
    return bookingList;
  }

  static async hostBookingsAction(params, bookingId, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    if (!user) throw ERROR_KEYS.BOOKING_NOT_FOUND;
    const trip = await TripModel.getById(booking.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const tripUpdate = {
      spotsReserved: trip.spotsReserved - booking.attendees,
    };
    let validForUpdate = false;
    if (params['action']) {
      switch (params['action']) {
        // host
        case 'approve':
          validForUpdate = true;
          if (!(user.isAdmin || trip.ownerId === user._id)) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          tripUpdate['status'] = 'approved';
          if (booking.totalFare && booking.totalFare > 0) {
            const paymentIntent = await StripeAPI.createPaymentIntent({
              amount: booking.pendingAmout,
              currency: booking.currency,
              customerId: booking.memberStripeId,
              paymentMethod,
              beneficiary: booking.onwerStripeId,
            });
          }

          break;

        // host
        case 'decline':
          validForUpdate = true;
          if (!(user.isAdmin || trip.ownerId === user._id)) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          tripUpdate['status'] = 'declined';
          if (booking.room) {
            tripUpdate['rooms'] = [];
            trip.rooms.forEach(room => {
              if (room.id == booking.room.id) {
                let filledCount = room['filled'] - booking.attendees;
                if (filledCount < 0) {
                  filledCount = 0;
                }
                room['filled'] = filledCount;
              }
              tripUpdate['rooms'].push(room);
            });
          }
          if (booking.addOns && booking.addOns.length > 0) {
            tripUpdate['addOns'] = [];
            trip.addOns.forEach(addOn => {
              const bAddon = booking.addOns.find(
                bAddOn => bAddOn.id === addOn.id
              );
              if (bAddon) {
                let filledCount = addOn['filled'] - bAddon.attendees;
                if (filledCount < 0) {
                  filledCount = 0;
                }
                addOn['filled'] = filledCount;
              }
              tripUpdate['addOns'].push(addOn);
            });
          }
          break;
        // guest
        case 'withdraw':
          validForUpdate = true;
          if (!(user.isAdmin || trip.memberId === user._id.toString())) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          tripUpdate['status'] = 'withdrawn';
          if (booking.room) {
            tripUpdate['rooms'] = [];
            trip.rooms.forEach(room => {
              if (room.id == booking.room.id) {
                let filledCount = room['filled'] - booking.attendees;
                if (filledCount < 0) {
                  filledCount = 0;
                }
                room['filled'] = filledCount;
              }
              tripUpdate['rooms'].push(room);
            });
          }
          if (booking.addOns && booking.addOns.length > 0) {
            tripUpdate['addOns'] = [];
            trip.addOns.forEach(addOn => {
              const bAddon = booking.addOns.find(
                bAddOn => bAddOn.id === addOn.id
              );
              if (bAddon) {
                let filledCount = addOn['filled'] - bAddon.attendees;
                if (filledCount < 0) {
                  filledCount = 0;
                }
                addOn['filled'] = filledCount;
              }
              tripUpdate['addOns'].push(addOn);
            });
          }
          break;

        default:
          throw ERROR_KEYS.INVALID_ACTION;
      }
    }
    if (validForUpdate) await TripModel.update(trip._id, tripUpdate);
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
