/**
 * @name - Booking controller
 * @description - This will handle business logic for Booking module
 */
import { Types } from 'mongoose';
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
import { BookingModel, UserModel, TripModel, MemberModel } from '../../models';
import {
  ERROR_KEYS,
  LogMessages,
  APP_CONSTANTS,
  EmailMessages,
} from '../../constants';
import { MemberController } from '../members/member.ctrl';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import _ from 'lodash';
import { MemberDirectoryController } from '../member-directory/member-directory.ctrl';

export class BookingController {
  static async getUsername(username) {
    const user = await UserModel.get({ username });
    if (user)
      return (
        username +
        moment()
          .unix()
          .toString()
      );
    return username;
  }
  static async createInvite(params, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (user.isHost || user.isAdmin) {
      const trip = await TripModel.getById(params.tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      let users = await UserModel.list({
        filter: { email: { $in: params.emails } },
        select: { email: 1 },
      });
      const foundEmails = users.map(user => user.email);
      const difference = _.difference(params.emails, foundEmails);
      // Create user if not exists already
      if (difference && difference.length > 0) {
        const createUsers = difference.map(async email => {
          const username = email.split('@')[0];
          return {
            updateOne: {
              filter: { email: email },
              update: {
                $set: {
                  email: email,
                  firstName: '',
                  lastName: '',
                  username: await BookingController.getUsername(username),
                },
              },
              upsert: true,
            },
          };
        });
        const insertData = await Promise.all(createUsers);
        await UserModel.bulkWrite(insertData);
      }

      // Add members to directory
      if (params.save_to_members) {
        const data = params?.emails?.split(',')?.map(email => {
          return { email: email };
        });
        if (data) await MemberDirectoryController.createMembers(data);
      }
      users = await UserModel.list({
        filter: { email: { $in: params.emails } },
        select: { email: 1 },
      });
      const memberIds = users.map(user => user._id.toString());
      if (params.attendee_action === 'direct_attendee') {
        const objMemberIds = users.map(user => user._id);
        const foundMembers = await MemberModel.list({
          filter: {
            tripId: params.tripId,
            memberId: objMemberIds,
            isMember: true,
          },
        });
        const foundMemberIds = foundMembers.map(member =>
          member.memberId.toString()
        );
        const diffIds = _.difference(memberIds, foundMemberIds);
        if (diffIds?.length > 0)
          await MemberController.memberAction({
            memberIds: diffIds,
            tripId: params.tripId,
            message: params.message || '',
            awsUserId,
            action: 'addMember',
            forceAddTraveler: true,
          });
      } else {
        const approvedBookings = await BookingModel.list({
          filter: {
            memberId: {
              $in: memberIds,
            },
            tripId: params.tripId,
            status: { $in: ['invite-accepted', 'approved'] },
          },
        });
        const approvedBookingIds = approvedBookings?.map(b => b.memberId) || [];
        const bookings = [];
        users.forEach(user => {
          let bookingStatus = 'invite-pending';
          if (params.attendee_action === 'send_invite') {
            bookingStatus = 'invite-accepted';
          }
          if (!approvedBookingIds.includes(user._id.toString()))
            bookings.push({
              updateOne: {
                filter: {
                  tripId: params.tripId,
                  memberId: user._id.toString(),
                },
                update: {
                  $set: {
                    tripId: params.tripId,
                    memberId: user._id.toString(),
                    addedByHost: true,
                    status: bookingStatus,
                  },
                },
                upsert: true,
              },
            });
        });
        await BookingModel.bulkWrite(bookings);
        if (params.attendee_action === 'send_invite') {
          params?.emails?.map(async email => {
            await EmailSender(
              { email: email },
              EmailMessages.MEMBER_INVITE_HOST,
              [trip._id.toString(), trip['title']]
            );
          });
        }
      }

      return 'success';
    } else throw ERROR_KEYS.UNAUTHORIZED;
  }
  static async removeInvite(params, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (user.isHost || user.isAdmin) {
      await BookingModel.delete({ _id: Types.ObjectId(params.booking_id) });
      return 'success';
    } else throw ERROR_KEYS.TRIP_NOT_FOUND;
  }
  static async sendReminder(params, awsUserId) {
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const users = await UserModel.list({
      filter: { email: { $in: params.emails } },
      select: { email: 1, firstName: 1, lastName: 1, username: 1 },
    });
    if (users && users.length > 0) {
      const bookings = await BookingModel.list({
        filter: {
          memberId: { $in: users.map(user => user._id.toString()) },
          tripId: params.tripId,
        },
      });
      users.map(async user => {
        const booking = bookings.find(b => b.memberId === user._id.toString());
        if (booking && booking.status === 'invite-pending') {
          console.log('Updating invite.....');
          await BookingModel.update(booking._id, { status: 'invite-accepted' });
        }
        await EmailSender(user, EmailMessages.MEMBER_INVITE_HOST, [
          trip._id.toString(),
          trip['title'],
        ]);
        return user;
      });
    }
  }
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
    if (finalBookingData['pendingAmount'] === 0) {
      finalBookingData['paymentStatus'] = 'full';
    } else {
      finalBookingData['isAutoPayEnabled'] = trip['isAutoPayEnabled'] == true;
      finalBookingData['autoChargeDate'] = moment(
        trip.startDate.toString(),
        'YYYYMMDD'
      )
        .utc()
        .subtract(21, 'days')
        .endOf('day')
        .unix();
    }
    finalBookingData['bookingExpireOn'] = moment()
      .add(trip.bookingExpiryDays || 3, 'days')
      .unix();

    const existingBooking = await BookingModel.get({
      tripId: finalBookingData['tripId'],
      memberId: finalBookingData['memberId'],
    });
    if (
      existingBooking &&
      ['approved', 'pending'].includes(existingBooking.status)
    )
      throw ERROR_KEYS.BOOKING_ALREADY_EXISTS;
    finalBookingData['status'] = 'pending';
    const status = getTripResourceValidity(trip, bookingData);
    if (status.rooms && status.addOns) throw ERROR_KEYS.TRIP_RESOURCES_FULL;
    let booking;
    if (existingBooking?._id)
      booking = await BookingModel.update(
        existingBooking._id,
        finalBookingData,
        {
          upsert: true,
        }
      );
    else booking = await BookingModel.create(finalBookingData);
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
      trip.bookingExpiryDays || 3,
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
      pendingAmount: 1,
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
      bookingExpireOn: 1,
      questions: 1,
    };
    const params = [{ $match: { tripId: filters.tripId } }];
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
    const { action, forceAddTraveler } = params || {};
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
            !forceAddTraveler
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
                  const ownerInfo = await UserModel.get({
                    _id: trip.ownerId,
                  });
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
                  currentDue: booking.pendingAmount,
                  pendingAmount: 0,
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
              pendingAmount: 0,
            };
          }
          await BookingModel.update(booking._id, bookingUpdate);
          await MemberController.memberAction({
            tripId: booking.tripId,
            action: 'addMember',
            forceAddTraveler: forceAddTraveler,
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
            bookingUpdate['pendingAmount'] = 0;
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
      pendingAmount: 1,
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
      questions: 1,
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

  static async multiUpdateBooking(bookingIds, booking, unsetFields) {
    const booking_ids = bookingIds.map(id => Types.ObjectId(id));
    if (unsetFields)
      await BookingModel.updateUnsetMany(
        { _id: { $in: booking_ids } },
        unsetFields
      );
    if (booking)
      await BookingModel.updateMany({ _id: { $in: booking_ids } }, booking);
  }

  static async getInvites(awsUserId, tripId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.get({
      memberId: user._id,
      tripId: tripId,
    });
    return booking;
  }
  static async respondInvite(bookingId, params) {
    const booking = await BookingModel.update(
      Types.ObjectId(bookingId),
      params
    );
    return booking;
  }
}
