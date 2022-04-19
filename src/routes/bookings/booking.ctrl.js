/**
 * @name - Booking controller
 * @description - This will handle business logic for Booking module
 */
import { StripeAPI, logActivity, EmailSender } from '../../utils';
import {
  getCost,
  getBookingValidity,
  getDepositStatus,
  getDiscountStatus,
  prepareSortFilter,
  addRoomResources,
  addAddonResources,
  removeAddonResources,
  removeRoomResources,
  getTripResourceValidity,
} from '../../helpers';
import { BookingModel, UserModel, TripModel } from '../../models';
import {
  ERROR_KEYS,
  LogMessages,
  APP_CONSTANTS,
  EmailMessages,
} from '../../constants';
import { MemberController } from '../members/member.ctrl';
import { ObjectID } from 'mongodb';
import moment from 'moment';

export class BookingController {
  static async createBooking(params, awsUserId) {
    const bookingData = params;
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (bookingData.attendees > trip.spotsAvailable)
      throw ERROR_KEYS.TRIP_IS_FULL;

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const tripOwner = await UserModel.get({ _id: trip.ownerId });
    if (!tripOwner) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!getBookingValidity(trip)) throw ERROR_KEYS.TRIP_BOOKING_CLOSED;
    bookingData['memberId'] = user._id.toString();
    bookingData['ownerId'] = tripOwner._id.toString();
    let costing = {};
    if (params['paymentStatus'] == 'deposit') {
      bookingData['isDepositApplicable'] = getDepositStatus(trip);
      if (!bookingData['isDepositApplicable'])
        throw ERROR_KEYS.TRIP_BOOKING_WITH_DEPOSIT_DATE_PASSED;
    }
    if (
      params['paymentStatus'] == 'full' ||
      params['paymentStatus'] == 'deposit'
    ) {
      bookingData['onwerStripeId'] = tripOwner.stripeAccountId;
      bookingData['memberStripeId'] = bookingData.stripePaymentMethod.customer;
      // Payment validation and calculation
      bookingData['isDiscountApplicable'] = getDiscountStatus(trip);
      bookingData['isDepositApplicable'] = getDepositStatus(trip);
      costing = getCost(bookingData);
    }
    const finalBookingData = {
      ...bookingData,
      ...costing,
    };
    if (finalBookingData['pendingAmout'] === 0) {
      finalBookingData['paymentStatus'] = 'full';
    } else {
      finalBookingData['autoChargeDate'] = moment(
        trip.startDate.toString(),
        'YYYYMMDD'
      )
        .utc()
        .subtract(21, 'days')
        .endOf('day')
        .unix();
    }

    const existingBooking = await BookingModel.get({
      tripId: finalBookingData['tripId'],
      memberId: finalBookingData['memberId'],
      status: { $in: ['approved', 'pending'] },
    });
    if (existingBooking) throw ERROR_KEYS.BOOKING_ALREADY_EXISTS;
    const status = getTripResourceValidity(trip, bookingData);
    if (status.rooms && status.addOns) throw ERROR_KEYS.TRIP_RESOURCES_FULL;
    const booking = await BookingModel.create(finalBookingData);
    const tripUpdate = {
      isLocked: true,
      rooms: addRoomResources(bookingData, trip, ['reserved']),
      addOns: addAddonResources(bookingData, trip, ['reserved']),
    };
    await TripModel.update(trip._id, tripUpdate);
    // Traveler activity record
    await logActivity({
      ...LogMessages.BOOKING_REQUEST_TRAVELER(trip['title']),
      tripId: trip._id.toString(),
      audienceIds: [user._id.toString()],
      userId: user._id.toString(),
    });
    // Host activity record
    await logActivity({
      ...LogMessages.BOOKING_REQUEST_HOST(user['firstName'], trip['title']),
      tripId: trip._id.toString(),
      audienceIds: [tripOwner._id.toString()],
      userId: user._id.toString(),
    });
    // Traveler email
    await EmailSender(user, EmailMessages.BOOKING_REQUEST_TRAVELER, [
      booking._id,
      trip._id.toString(),
      trip['title'],
    ]);

    //Host email
    await EmailSender(tripOwner, EmailMessages.BOOKING_REQUEST_HOST, [
      trip._id.toString(),
      trip['title'],
    ]);
    return booking;
  }

  static async listBookings(filters, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!filters.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const trip = await TripModel.getById(filters.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (!(user.isAdmin || trip.ownerId.toString() === user._id.toString())) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const bookingProjection = {
      currency: 1,
      addOns: 1,
      guests: 1,
      status: 1,
      totalBaseFare: 1,
      totalAddonFare: 1,
      discountBaseFare: 1,
      discountAddonFare: 1,
      totalFare: 1,
      currentDue: 1,
      paidAmout: 1,
      pendingAmout: 1,
      paymentHistory: 1,
      stripePaymentMethod: 1,
      attendees: 1,
      rooms: 1,
      paymentStatus: 1,
      message: 1,
      deposit: 1,
      discount: 1,
      tripId: 1,
      createdAt: 1,
      updatedAt: 1,
      autoChargeDate: 1,
    };
    const params = [{ $match: { tripId: filters.tripId, status: 'pending' } }];
    params.push({
      $sort: prepareSortFilter(
        filters,
        ['createdAt', 'updatedAt'],
        'updatedAt',
        -1
      ),
    });
    const limit = filters.limit ? parseInt(filters.limit) : APP_CONSTANTS.LIMIT;
    const page = filters.page ? parseInt(filters.page) : APP_CONSTANTS.PAGE;
    params.push({ $skip: limit * page });
    params.push({ $limit: limit });
    params.push({
      $project: {
        memberId: {
          $toObjectId: '$memberId',
        },
        ...bookingProjection,
      },
    });
    params.push({
      $lookup: {
        from: 'users',
        localField: 'memberId',
        foreignField: '_id',
        as: 'memberDetails',
      },
    });
    params.push({
      $unwind: {
        path: '$memberDetails',
        preserveNullAndEmptyArrays: true,
      },
    });
    const bookingList = BookingModel.aggregate(params);
    return bookingList;
  }

  static async payBalance(params, awsUserId) {
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
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    if (!booking) throw ERROR_KEYS.BOOKING_NOT_FOUND;
    const trip = await TripModel.getById(booking.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const tripUpdate = {
      spotsReserved: trip.spotsReserved - booking.attendees,
    };
    tripUpdate['spotsReserved'] =
      tripUpdate['spotsReserved'] < 0 ? 0 : tripUpdate['spotsReserved'];
    let validForUpdate = false;
    let bookingUpdate = {};
    const memberInfo = await UserModel.get({
      _id: ObjectID(booking.memberId),
    });
    const { action, forceAddTraveller } = params || {};
    if (action) {
      switch (action) {
        // host
        case 'approve':
          validForUpdate = true;
          if (
            !(user.isAdmin || trip.ownerId.toString() === user._id.toString())
          ) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          if (
            trip.spotsAvailable - booking.attendees < 0 &&
            !forceAddTraveller
          ) {
            throw ERROR_KEYS.TRIP_IS_FULL_HOST;
          }
          if (booking.totalFare && booking.totalFare > 0) {
            if (booking.status !== 'pending') {
              console.log('Request already processed');
              throw ERROR_KEYS.INVALID_ACTION;
            }
            try {
              let paymentIntent = true;
              let needStripeIdUpdate = false;
              if (booking.currentDue > 1) {
                if (!booking.onwerStripeId) {
                  const ownerInfo = await UserModel.get({ _id: trip.ownerId });
                  if (ownerInfo.stripeAccountId) {
                    booking['onwerStripeId'] = ownerInfo.stripeAccountId;
                    needStripeIdUpdate = true;
                  } else throw ERROR_KEYS.PAYMENT_FAILED;
                }
                paymentIntent = await StripeAPI.createPaymentIntent({
                  amount: parseInt(booking.currentDue * 100),
                  currency: booking.currency,
                  customerId: booking.memberStripeId,
                  paymentMethod: booking.stripePaymentMethod.id,
                  confirm: true,
                  beneficiary: booking.onwerStripeId,
                  hostShare: user.hostShare,
                });
              }

              if (paymentIntent) {
                booking.paymentHistory.push({
                  amount: booking.currentDue,
                  paymentMethod: booking.stripePaymentMethod,
                  currency: booking.currency,
                  paymentIntent: paymentIntent,
                });

                bookingUpdate = {
                  paymentHistory: booking.paymentHistory,
                  paidAmout: booking.currentDue,
                  currentDue: booking.pendingAmout,
                  pendingAmout: 0,
                  status: 'approved',
                };
                if (needStripeIdUpdate)
                  bookingUpdate['onwerStripeId'] = booking.onwerStripeId;
                if (booking.paymentStatus == 'deposit') {
                  await logActivity({
                    ...LogMessages.BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_HOST(
                      `${memberInfo.firstName} ${memberInfo.lastName}`,
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [user._id.toString()],
                    userId: user._id.toString(),
                  });
                  await logActivity({
                    ...LogMessages.BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_TRAVELER(
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [memberInfo._id.toString()],
                    userId: user._id.toString(),
                  });
                } else {
                  await logActivity({
                    ...LogMessages.BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_HOST(
                      `${memberInfo.firstName} ${memberInfo.lastName}`,
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [user._id.toString()],
                    userId: user._id.toString(),
                  });
                  await logActivity({
                    ...LogMessages.BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_TRAVELER(
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [memberInfo._id.toString()],
                    userId: user._id.toString(),
                  });
                }
                // Traveler
                await EmailSender(
                  memberInfo,
                  EmailMessages.BOOKING_REQUEST_ACCEPTED_TRAVELER,
                  [trip._id.toString(), trip['title']]
                );

                // host
                await EmailSender(
                  user,
                  EmailMessages.BOOKING_REQUEST_ACCEPTED_HOST,
                  [trip._id.toString(), trip['title'], memberInfo['firstName']]
                );
              } else {
                throw 'payment failed';
              }
            } catch (err) {
              console.log(err);
              if (booking.paymentStatus == 'deposit') {
                await logActivity({
                  ...LogMessages.BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_HOST(
                    `${memberInfo.firstName} ${memberInfo.lastName}`,
                    trip['title']
                  ),
                  tripId: trip._id.toString(),
                  audienceIds: [user._id.toString()],
                  userId: user._id.toString(),
                });
                await logActivity({
                  ...LogMessages.BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_TRAVELER(
                    trip['title']
                  ),
                  tripId: trip._id.toString(),
                  audienceIds: [memberInfo._id.toString()],
                  userId: user._id.toString(),
                });
              } else {
                await logActivity({
                  ...LogMessages.BOOKING_REQUEST_FULL_PAYMENT_FAILED_HOST(
                    `${memberInfo.firstName} ${memberInfo.lastName}`,
                    trip['title']
                  ),
                  tripId: trip._id.toString(),
                  audienceIds: [user._id.toString()],
                  userId: user._id.toString(),
                });
                await logActivity({
                  ...LogMessages.BOOKING_REQUEST_FULL_PAYMENT_FAILED_TRAVELER(
                    trip['title']
                  ),
                  tripId: trip._id.toString(),
                  audienceIds: [memberInfo._id.toString()],
                  userId: user._id.toString(),
                });
              }
              throw ERROR_KEYS.PAYMENT_FAILED;
            }
          } else {
            bookingUpdate = {
              status: 'approved',
              paidAmout: 0,
              currentDue: 0,
              pendingAmout: 0,
            };
          }
          await BookingModel.update(booking._id, bookingUpdate);
          await MemberController.memberAction({
            tripId: booking.tripId,
            action: 'addMember',
            forceAddTraveller: forceAddTraveller,
            memberIds: [booking.memberId],
            bookingId: bookingId,
            awsUserId: awsUserId,
          });

          await logActivity({
            ...LogMessages.BOOKING_REQUEST_APPROVE_TRAVELER(trip['title']),
            tripId: trip._id.toString(),
            audienceIds: [memberInfo._id.toString()],
            userId: user._id.toString(),
          });
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_APPROVE_HOST(
              `${memberInfo.firstName} ${memberInfo.lastName}`,
              trip['title']
            ),
            tripId: trip._id.toString(),
            audienceIds: [user._id.toString()],
            userId: user._id.toString(),
          });
          break;

        // host
        case 'decline':
          validForUpdate = true;
          if (
            !(user.isAdmin || trip.ownerId.toString() == user._id.toString())
          ) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          if (booking.status !== 'pending') {
            console.log('Request alrady processed');
            throw ERROR_KEYS.INVALID_ACTION;
          }
          bookingUpdate = {
            status: 'declined',
          };
          await BookingModel.update(booking._id, bookingUpdate);
          tripUpdate['rooms'] = removeRoomResources(booking, trip, [
            'reserved',
          ]);
          tripUpdate['addOns'] = removeAddonResources(booking, trip, [
            'reserved',
          ]);
          // Traveler
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_DECLINE_TRAVELER(trip['title']),
            tripId: trip._id.toString(),
            audienceIds: [memberInfo._id.toString()],
            userId: user._id.toString(),
          });
          // Host
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_DECLINE_HOST(
              `${memberInfo.firstName} ${memberInfo.lastName}`,
              trip['title']
            ),
            tripId: trip._id.toString(),
            audienceIds: [user._id.toString()],
            userId: user._id.toString(),
          });
          // Traveler
          await EmailSender(
            memberInfo,
            EmailMessages.BOOKING_REQUEST_DECLINED_TRAVELER,
            [trip._id.toString(), trip['title']]
          );

          // host
          await EmailSender(user, EmailMessages.BOOKING_REQUEST_DECLINED_HOST, [
            trip._id.toString(),
            trip['title'],
            memberInfo['firstName'],
          ]);
          break;
        // guest
        case 'withdraw':
          validForUpdate = true;
          const tripOwner = await UserModel.get({ _id: trip.ownerId });
          if (!tripOwner) throw ERROR_KEYS.USER_NOT_FOUND;
          if (!(user.isAdmin || booking.memberId === user._id.toString())) {
            throw ERROR_KEYS.UNAUTHORIZED;
          }
          if (!(booking.status == 'pending' || booking.status == 'approved')) {
            console.log('Request already processed');
            throw ERROR_KEYS.INVALID_ACTION;
          }
          await BookingModel.update(booking._id, {
            status: 'withdrawn',
          });
          tripUpdate['rooms'] = removeRoomResources(booking, trip, [
            'reserved',
          ]);
          tripUpdate['addOns'] = removeAddonResources(booking, trip, [
            'reserved',
          ]);
          // traveler
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_WITHDRAW_TRAVELER(trip['title']),
            tripId: trip._id.toString(),
            audienceIds: [user._id.toString()],
            userId: user._id.toString(),
          });
          // host
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_WITHDRAW_HOST(
              `${user.firstName} ${user.lastName}`,
              trip['title']
            ),
            tripId: trip._id.toString(),
            audienceIds: [trip.ownerId.toString()],
            userId: user._id.toString(),
          });
          // Traveler
          await EmailSender(
            memberInfo,
            EmailMessages.BOOKING_REQUEST_WITHDRAWN_TRAVELER,
            [trip._id.toString(), trip['title']]
          );

          // host
          await EmailSender(
            tripOwner,
            EmailMessages.BOOKING_REQUEST_WITHDRAWN_HOST,
            [trip._id.toString(), trip['title'], memberInfo['firstName']]
          );
          break;

        default:
          throw ERROR_KEYS.INVALID_ACTION;
      }
    }
    if (validForUpdate) await TripModel.update(trip._id, tripUpdate);
    return 'success';
  }

  static async getBooking(bookingId) {
    const booking = await BookingModel.getById(bookingId);
    return booking;
  }

  static async doPartPayment(bookingId, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    const memberInfo = await UserModel.get({
      _id: ObjectID(booking.memberId),
    });

    if (user._id.toString() === booking.memberId) {
      if (booking.totalFare && booking.totalFare > 0) {
        if (booking.status !== 'approved' && booking.currentDue <= 0) {
          console.log('Request already processed');
          throw ERROR_KEYS.INVALID_ACTION;
        }
        const tripInfo = await TripModel.get({
          _id: ObjectID(booking.tripId),
        });
        const ownerInfo = await UserModel.get({
          _id: tripInfo.ownerId,
        });
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

            bookingUpdate['paidAmout'] = booking.paidAmout + booking.currentDue;
            bookingUpdate['pendingAmout'] = 0;
            bookingUpdate['currentDue'] = 0;
            bookingUpdate['paymentStatus'] = 'full';

            await BookingModel.update(booking._id, bookingUpdate);
            await logActivity({
              ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_HOST(
                `${memberInfo.firstName} ${memberInfo.lastName}`,
                tripInfo['title']
              ),
              tripId: tripInfo._id.toString(),
              audienceIds: [ownerInfo._id.toString()],
              userId: user._id.toString(),
            });
            await logActivity({
              ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_TRAVELER(
                tripInfo['title']
              ),
              tripId: tripInfo._id.toString(),
              audienceIds: [memberInfo._id.toString()],
              userId: user._id.toString(),
            });
          } else {
            throw 'payment failed';
          }
        } catch (err) {
          console.log(err);
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_HOST(
              `${memberInfo.firstName} ${memberInfo.lastName}`,
              tripInfo['title']
            ),
            tripId: tripInfo._id.toString(),
            audienceIds: [user._id.toString()],
            userId: user._id.toString(),
          });
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_TRAVELER(
              tripInfo['title']
            ),
            tripId: tripInfo._id.toString(),
            audienceIds: [memberInfo._id.toString()],
            userId: user._id.toString(),
          });
          throw ERROR_KEYS.PAYMENT_FAILED;
        }
      }
    } else {
      console.log('Inside do part payment');
      throw ERROR_KEYS.INVALID_ACTION;
    }
    return booking;
  }

  static async listGuestBookings(filters, guestAwsId) {
    const user = await UserModel.get({ awsUserId: guestAwsId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const bookingProjection = {
      currency: 1,
      addOns: 1,
      guests: 1,
      status: 1,
      totalBaseFare: 1,
      totalAddonFare: 1,
      discountBaseFare: 1,
      discountAddonFare: 1,
      totalFare: 1,
      currentDue: 1,
      paidAmout: 1,
      pendingAmout: 1,
      paymentHistory: 1,
      stripePaymentMethod: 1,
      attendees: 1,
      rooms: 1,
      paymentStatus: 1,
      message: 1,
      deposit: 1,
      discount: 1,
      memberId: 1,
      createdAt: 1,
      updatedAt: 1,
      autoChargeDate: 1,
    };
    const params = [
      {
        $match: {
          status: 'pending',
          memberId: user._id.toString(),
        },
      },
    ];
    params.push({
      $sort: prepareSortFilter(
        filters,
        ['createdAt', 'updatedAt'],
        'updatedAt',
        -1
      ),
    });
    const limit = filters.limit ? parseInt(filters.limit) : APP_CONSTANTS.LIMIT;
    const page = filters.page ? parseInt(filters.page) : APP_CONSTANTS.PAGE;
    params.push({ $skip: limit * page });
    params.push({ $limit: limit });
    params.push({
      $project: {
        tripId: {
          $toObjectId: '$tripId',
        },
        ...bookingProjection,
      },
    });
    params.push({
      $lookup: {
        from: 'trips',
        localField: 'tripId',
        foreignField: '_id',
        as: 'trip',
      },
    });
    params.push({
      $unwind: {
        path: '$trip',
        preserveNullAndEmptyArrays: true,
      },
    });

    params.push({
      $lookup: {
        from: 'users',
        localField: 'trip.ownerId',
        foreignField: '_id',
        as: 'ownerDetails',
      },
    });
    params.push({
      $unwind: {
        path: '$ownerDetails',
        preserveNullAndEmptyArrays: true,
      },
    });
    const bookings = await BookingModel.aggregate(params);
    return bookings;
  }

  static async updateBooking(id, params) {
    await BookingModel.update(id, params);
    return 'success';
  }
}
