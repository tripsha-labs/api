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
import { MemberController } from '../members/member.ctrl';

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
    await dbConnect();
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!params.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (!(user.isAdmin || trip.ownerId.toString() === user._id.toString())) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const bookingList = BookingModel.list({ tripId: params.tripId });
    return bookingList;
  }

  static async payBalance(params, awsUserId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!params.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (!(user.isAdmin || trip.ownerId.toString() === user._id.toString())) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const bookingList = BookingModel.list({ tripId: params.tripId });
    return bookingList;
  }

  static async bookingsAction(params, bookingId, awsUserId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    if (!booking) throw ERROR_KEYS.BOOKING_NOT_FOUND;
    const trip = await TripModel.getById(booking.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const tripUpdate = {
      spotsReserved: trip.spotsReserved - booking.attendees,
    };
    console.log(params);
    let validForUpdate = false;
    if (params['action']) {
      switch (params['action']) {
        // host
        case 'approve':
          validForUpdate = true;
          if (
            !(user.isAdmin || trip.ownerId.toString() === user._id.toString())
          ) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          if (booking.totalFare && booking.totalFare > 0) {
            if (booking.status !== 'pending') {
              console.log('Request alrady processed');
              throw ERROR_KEYS.INVALID_ACTION;
            }
            const paymentIntent = await StripeAPI.createPaymentIntent({
              amount: parseInt(booking.pendingAmout * 100),
              currency: booking.currency,
              customerId: booking.memberStripeId,
              paymentMethod: booking.stripePaymentMethod.id,
              confirm: true,
              beneficiary: booking.onwerStripeId,
            });

            if (paymentIntent) {
              booking.paymentHistory.push({
                amount: booking.pendingAmout,
                paymentMethod: booking.stripePaymentMethod,
                currency: booking.currency,
                paymentIntent: paymentIntent,
              });
              const bookingUpdate = {
                paymentHistory: booking.paymentHistory,
                paidAmout: booking.pendingAmout,
                status: 'approved',
              };
              if (booking.paymentStatus == 'deposit') {
                bookingUpdate['paidAmout'] = booking.pendingAmout;
                bookingUpdate['pendingAmout'] = booking.currentDue;
                bookingUpdate['currentDue'] = 0;
              } else {
                bookingUpdate['paidAmout'] = booking.pendingAmout;
                bookingUpdate['pendingAmout'] = 0;
                bookingUpdate['currentDue'] = 0;
                bookingUpdate['paymentStatus'] = 'full';
              }
              await BookingModel.update(booking._id, bookingUpdate);
              await MemberController.memberAction({
                tripId: booking.tripId,
                action: 'addMember',
                memberIds: [booking.memberId],
                awsUserId: awsUserId,
              });
            }
          }

          break;

        // host
        case 'decline':
          validForUpdate = true;
          if (!(user.isAdmin || trip.ownerId === user._id)) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          if (booking.status !== 'pending') {
            console.log('Request alrady processed');
            throw ERROR_KEYS.INVALID_ACTION;
          }
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
          const bookingUpdate = {
            status: 'declined',
          };
          await BookingModel.update(booking._id, bookingUpdate);
          break;
        // guest
        case 'withdraw':
          validForUpdate = true;
          if (!(user.isAdmin || trip.memberId === user._id.toString())) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          if (booking.status !== 'pending') {
            console.log('Request alrady processed');
            throw ERROR_KEYS.INVALID_ACTION;
          }
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

          await BookingModel.update(booking._id, {
            status: 'withdrawn',
          });
          break;

        default:
          throw ERROR_KEYS.INVALID_ACTION;
      }
    }
    if (validForUpdate) await TripModel.update(trip._id, tripUpdate);
  }

  static async getBooking(bookingId) {
    await dbConnect();
    const booking = await BookingModel.getById(bookingId);
    return booking;
  }

  static async doPartPayment(bookingId, awsUserId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    if (user._id.toString() === booking.memberId) {
      if (booking.totalFare && booking.totalFare > 0) {
        if (booking.status !== 'approved' && booking.pendingAmout <= 0) {
          console.log('Request alrady processed');
          throw ERROR_KEYS.INVALID_ACTION;
        }
        const paymentIntent = await StripeAPI.createPaymentIntent({
          amount: booking.pendingAmout,
          currency: booking.currency,
          customerId: booking.memberStripeId,
          paymentMethod: booking.stripePaymentMethod.id,
          confirm: true,
          beneficiary: booking.onwerStripeId,
        });
        if (paymentIntent) {
          booking.paymentHistory.push({
            amount: booking.pendingAmout,
            paymentMethod: booking.stripePaymentMethod,
            currency: booking.currency,
            paymentIntent: paymentIntent,
          });
          const bookingUpdate = {
            paymentHistory: booking.paymentHistory,
            paidAmout: booking.paidAmout + booking.pendingAmout,
          };

          bookingUpdate['paidAmout'] = booking.paidAmout + booking.pendingAmout;
          bookingUpdate['pendingAmout'] = 0;
          bookingUpdate['currentDue'] = 0;
          bookingUpdate['paymentStatus'] = 'full';

          await BookingModel.update(booking._id, bookingUpdate);
        }
      }
    } else {
      throw ERROR_KEYS.INVALID_ACTION;
    }
    return bookings;
  }

  static async listGuestBookings(guestAwsId) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: guestAwsId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    console.log(user._id);
    const bookings = await BookingModel.list({ memberId: user._id.toString() });
    return bookings;
  }

  static async updateBooking(id, params) {
    await dbConnect();
    await BookingModel.update(id, params);
    return 'success';
  }
}
