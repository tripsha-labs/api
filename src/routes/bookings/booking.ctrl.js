/**
 * @name - Booking controller
 * @description - This will handle business logic for Booking module
 */
import { dbConnect, StripeAPI, logActivity, sendEmail } from '../../utils';
import {
  getCosting,
  getBookingValidity,
  getDepositStatus,
  getDiscountStatus,
  prepareSortFilter,
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

export class BookingController {
  static async createBooking(params, awsUserId) {
    await dbConnect();
    const bookingData = {
      ...params,
    };
    const trip = await TripModel.getById(params.tripId);
    const spotsReserved = trip.spotsReserved + bookingData.attendees;
    const spotsFilled = trip.spotsFilled + spotsReserved;
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (
      bookingData.attendees > trip.spotsAvailable ||
      spotsFilled > trip.spotsAvailable
    )
      throw ERROR_KEYS.TRIP_IS_FULL;

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const tripOwner = await UserModel.get({ _id: trip.ownerId });
    if (!tripOwner) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!getBookingValidity(trip)) throw ERROR_KEYS.TRIP_BOOKING_CLOSED;
    bookingData['memberId'] = user._id.toString();
    bookingData['ownerId'] = tripOwner._id.toString();
    let costing = {};
    if (
      params['paymentStatus'] == 'full' ||
      params['paymentStatus'] == 'deposit'
    ) {
      bookingData['onwerStripeId'] = tripOwner.stripeAccountId;
      bookingData['memberStripeId'] = bookingData.stripePaymentMethod.customer;
      // Payment validation and calculation
      bookingData['isDiscountApplicable'] = getDiscountStatus(trip);
      bookingData['isDepositApplicable'] = getDepositStatus(trip);
      costing = getCosting(bookingData);
    }
    const finalBookingData = {
      ...bookingData,
      ...costing,
    };
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
    // Traveller activity record
    await logActivity({
      ...LogMessages.BOOKING_REQUEST_TRAVELLER(trip['title']),
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
    // Traveller email
    await sendEmail({
      emails: [user['email']],
      name: user['firstName'],
      subject: EmailMessages.BOOKING_REQUEST_TRAVELLER.subject,
      message: EmailMessages.BOOKING_REQUEST_TRAVELLER.message(
        booking._id,
        trip._id.toString(),
        trip['title']
      ),
    });
    //Host email
    await sendEmail({
      emails: [tripOwner['email']],
      name: tripOwner['firstName'],
      subject: EmailMessages.BOOKING_REQUEST_HOST.subject,
      message: EmailMessages.BOOKING_REQUEST_HOST.message(
        trip._id.toString(),
        trip['title']
      ),
    });
    return booking;
  }

  static async listBookings(filters, awsUserId) {
    await dbConnect();
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
      room: 1,
      paymentStatus: 1,
      message: 1,
      deposit: 1,
      discount: 1,
      tripId: 1,
      createdAt: 1,
      updatedAt: 1,
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
              const paymentIntent = await StripeAPI.createPaymentIntent({
                amount: parseInt(booking.currentDue * 100),
                currency: booking.currency,
                customerId: booking.memberStripeId,
                paymentMethod: booking.stripePaymentMethod.id,
                confirm: true,
                beneficiary: booking.onwerStripeId,
              });

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
                    ...LogMessages.BOOKING_REQUEST_INITIAL_PAYMENT_SUCCESS_TRAVELLER(
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
                    ...LogMessages.BOOKING_REQUEST_FULL_PAYMENT_SUCCESS_TRAVELLER(
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [memberInfo._id.toString()],
                    userId: user._id.toString(),
                  });
                }
                // Traveller
                await sendEmail({
                  emails: [memberInfo['email']],
                  name: memberInfo['firstName'],
                  subject:
                    EmailMessages.BOOKING_REQUEST_ACCEPTED_TRAVELLER.subject,
                  message: EmailMessages.BOOKING_REQUEST_ACCEPTED_TRAVELLER.message(
                    trip._id.toString(),
                    trip['title']
                  ),
                });
                // host
                await sendEmail({
                  emails: [user['email']],
                  name: user['firstName'],
                  subject: EmailMessages.BOOKING_REQUEST_ACCEPTED_HOST.subject,
                  message: EmailMessages.BOOKING_REQUEST_ACCEPTED_HOST.message(
                    trip._id.toString(),
                    trip['title'],
                    memberInfo['firstName']
                  ),
                });
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
                  ...LogMessages.BOOKING_REQUEST_INITIAL_PAYMENT_FAILED_TRAVELLER(
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
                  ...LogMessages.BOOKING_REQUEST_FULL_PAYMENT_FAILED_TRAVELLER(
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
            ...LogMessages.BOOKING_REQUEST_APPROVE_TRAVELLER(trip['title']),
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
          bookingUpdate = {
            status: 'declined',
          };
          await BookingModel.update(booking._id, bookingUpdate);
          // Traveller
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_DECLINE_TRAVELLER(trip['title']),
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
          // Traveller
          await sendEmail({
            emails: [memberInfo['email']],
            name: memberInfo['firstName'],
            subject: EmailMessages.BOOKING_REQUEST_DECLINED_TRAVELLER.subject,
            message: EmailMessages.BOOKING_REQUEST_DECLINED_TRAVELLER.message(
              trip._id.toString(),
              trip['title']
            ),
          });
          // host
          await sendEmail({
            emails: [user['email']],
            name: user['firstName'],
            subject: EmailMessages.BOOKING_REQUEST_DECLINED_HOST.subject,
            message: EmailMessages.BOOKING_REQUEST_DECLINED_HOST.message(
              trip._id.toString(),
              trip['title'],
              memberInfo['firstName']
            ),
          });
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
          // traveller
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_WITHDRAW_TRAVELLER(trip['title']),
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
          // Traveller
          await sendEmail({
            emails: [memberInfo['email']],
            name: memberInfo['firstName'],
            subject: EmailMessages.BOOKING_REQUEST_WITHDRAWN_TRAVELLER.subject,
            message: EmailMessages.BOOKING_REQUEST_WITHDRAWN_TRAVELLER.message(
              trip._id.toString(),
              trip['title']
            ),
          });
          // host
          await sendEmail({
            emails: [tripOwner['email']],
            name: tripOwner['firstName'],
            subject: EmailMessages.BOOKING_REQUEST_WITHDRAWN_HOST.subject,
            message: EmailMessages.BOOKING_REQUEST_WITHDRAWN_HOST.message(
              trip._id.toString(),
              trip['title'],
              memberInfo['firstName']
            ),
          });
          break;

        default:
          throw ERROR_KEYS.INVALID_ACTION;
      }
    }
    if (validForUpdate) await TripModel.update(trip._id, tripUpdate);
    return 'success';
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
    const memberInfo = await UserModel.get({
      _id: ObjectID(booking.memberId),
    });
    if (user._id.toString() === booking.memberId) {
      if (booking.totalFare && booking.totalFare > 0) {
        if (booking.status !== 'approved' && booking.currentDue <= 0) {
          console.log('Request already processed');
          throw ERROR_KEYS.INVALID_ACTION;
        }
        try {
          const paymentIntent = await StripeAPI.createPaymentIntent({
            amount: parseInt(booking.currentDue * 100),
            currency: booking.currency,
            customerId: booking.memberStripeId,
            paymentMethod: booking.stripePaymentMethod.id,
            confirm: true,
            beneficiary: booking.onwerStripeId,
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
                trip['title']
              ),
              tripId: trip._id.toString(),
              audienceIds: [user._id.toString()],
              userId: user._id.toString(),
            });
            await logActivity({
              ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_SUCCESS_TRAVELLER(
                trip['title']
              ),
              tripId: trip._id.toString(),
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
              trip['title']
            ),
            tripId: trip._id.toString(),
            audienceIds: [user._id.toString()],
            userId: user._id.toString(),
          });
          await logActivity({
            ...LogMessages.BOOKING_REQUEST_BALANCE_PAYMENT_FAILED_TRAVELLER(
              trip['title']
            ),
            tripId: trip._id.toString(),
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
    await dbConnect();
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
      room: 1,
      paymentStatus: 1,
      message: 1,
      deposit: 1,
      discount: 1,
      memberId: 1,
      createdAt: 1,
      updatedAt: 1,
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
    await dbConnect();
    await BookingModel.update(id, params);
    return 'success';
  }
}
