/**
 * @name - Booking controller
 * @description - This will handle business logic for Booking module
 */
import { Types } from 'mongoose';
import {
  StripeAPI,
  logActivity,
  EmailSender,
  sendCustomEmail,
  bookingProjection,
} from '../../utils';
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
import { checkPermission } from '../../helpers/db-helper';

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
  static async createInvite(params, currentUser) {
    // Validate trip exists
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    // Check permissions
    if (
      await checkPermission(currentUser, trip, 'travelerManagement', 'edit')
    ) {
      // Check if emails are already exists
      let users = await UserModel.list({
        filter: { email: { $in: params.emails } },
        select: { email: 1 },
      });
      const foundEmails = users.map(user => user.email);
      // Get the new emails to add
      const difference = _.difference(params.emails, foundEmails);
      // Create users if not exists already
      if (difference?.length > 0) {
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

      // Add members to member directory
      if (params?.save_to_members) {
        const data = params?.emails?.map(email => {
          return { email: email };
        });
        if (data?.length > 0)
          await MemberDirectoryController.createMembers(data, currentUser);
      }
      // Fetch user list once again for newly added users
      users = await UserModel.list({
        filter: { email: { $in: params.emails } },
        select: { email: 1 },
      });
      const bookingList = await BookingModel.list({
        filter: {
          tripId: trip._id,
          memberId: { $in: users.map(user => user._id) },
        },
      });
      const bookingKeyPair = {};
      bookingList.map(b => {
        bookingKeyPair[b.memberId.toString()] = b;
      });
      // Step 1 create bookings entries
      const bookings = [];
      // Post booking operations like adding to conversation, sending email etc.
      const membersToadd = [];
      users?.forEach(user => {
        const filter = { memberId: user._id, tripId: trip._id };
        const bookingPayload = {
          onwerId: trip.ownerId,
          memberId: user._id,
          tripId: trip._id,
          addedByHost: true,
          message: 'Member added by Host',
          tripPaymentType: trip.tripPaymentType,
        };
        let updateRequired = true;
        switch (params?.attendee_action) {
          case 'direct_attendee':
            bookingPayload['status'] = 'approved';
            // TODO: handle email notifications
            if (bookingKeyPair.hasOwnProperty(user._id.toString())) {
              // TODO: If status==pending handle payment case
              if (bookingKeyPair[user._id.toString()].status === 'approved')
                updateRequired = false;
            }
            if (updateRequired) {
              membersToadd.push(user._id.toString());
            }
            break;
          case 'send_invite':
            bookingPayload['status'] = 'invited';
            if (bookingKeyPair.hasOwnProperty(user._id.toString())) {
              updateRequired = ![
                'approved',
                'pending',
                'invite-accepted',
              ].includes(bookingKeyPair[user._id.toString()].status);
            }
            break;
          case 'just_add':
          default:
            bookingPayload['status'] = 'invite-pending';
            if (bookingKeyPair.hasOwnProperty(user._id.toString())) {
              updateRequired = ![
                'invited',
                'approved',
                'pending',
                'invite-accepted',
                'invite-declined',
              ].includes(bookingKeyPair[user._id.toString()].status);
            }
            break;
        }
        if (updateRequired)
          bookings.push({
            updateOne: {
              filter: filter,
              update: {
                $set: bookingPayload,
              },
              upsert: true,
            },
          });
      });

      await BookingModel.bulkWrite(bookings);
      // Step 2 create members
      // Get all the bookings for member addition
      const resBookings = await BookingModel.aggregate([
        {
          $match: {
            tripId: trip._id,
            memberId: { $in: users.map(user => user._id) },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'memberId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: { email: 1, firstName: 1, lastName: 1 },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            user: 1,
            status: 1,
            memberId: 1,
            tripId: 1,
          },
        },
      ]);

      const membersPayload = resBookings?.map(booking => {
        const filter = {
          tripId: booking.tripId,
          memberId: booking.memberId,
        };
        const memberPayload = {
          tripId: booking.tripId,
          memberId: booking.memberId,
          bookingId: booking._id,
          isMember: booking.status == 'approved',
          removeRequested: false,
          isActive: true,
          leftOn: -1,
          joinedOn: moment().unix(),
        };

        return {
          updateOne: {
            filter: filter,
            update: {
              $set: memberPayload,
            },
            upsert: true,
          },
        };
      });
      await MemberModel.bulkUpdate(membersPayload);

      if (params?.attendee_action === 'send_invite') {
        const resEmails = resBookings.map(booking => {
          return EmailSender(
            { email: booking?.user?.email },
            EmailMessages.MEMBER_INVITE_HOST,
            [
              trip._id.toString(),
              trip['title'],
              `${booking?.user?.firstName || ''} ${booking?.user?.lastName ||
                ''}`,
              booking._id.toString(),
            ]
          );
        });
        await Promise.all(resEmails);
      }
      // Step 3: post booking oprrations
      if (membersToadd.length > 0) {
        await MemberController.memberAction(
          {
            memberIds: membersToadd,
            tripId: trip._id.toString(),
            message: params.message || '',
            action: 'addMember',
          },
          currentUser
        );
      }
      return 'success';
    } else throw ERROR_KEYS.UNAUTHORIZED;
  }
  static async removeInvite(params, user) {
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(params.booking_id);
    if (!booking) throw ERROR_KEYS.BOOKING_NOT_FOUND;
    const trip = await TripModel.getById(booking.tripId.toString());
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (await checkPermission(user, trip, 'travelerManagement', 'edit')) {
      const member = await MemberModel.get({
        memberId: booking.memberId,
        tripId: booking.tripId,
      });
      if (member.isMember || member.isFavorite)
        await MemberModel.update(
          { memberId: booking.memberId, tripId: booking.tripId },
          {
            message: params.message || '',
            isInvite: false,
            isActive: member.isMember || member.isFavorite,
          }
        );
      else
        await MemberModel.delete({
          memberId: booking.memberId,
          tripId: booking.tripId,
        });
      await BookingModel.delete({
        _id: booking._id,
      });
      return 'success';
    } else throw ERROR_KEYS.TRIP_NOT_FOUND;
  }
  static async sendCustomEmailMessage(params) {
    const user = await UserModel.getById(params.memberId);
    await EmailSender(
      user,
      { message: () => params.message, subject: params.subject },
      ['', ''],
      'custom'
    );
    return 'success';
  }

  static async createBooking(params, currentUser) {
    const bookingData = params;
    // Fetch trip information and validate if exists
    const trip = await TripModel.getById(params.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;

    if (!trip.isBookingEnabled) throw ERROR_KEYS.BOOKING_DISABLED;

    if (bookingData.attendees > trip.spotsAvailable)
      throw ERROR_KEYS.TRIP_IS_FULL;

    const user = currentUser;
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    // Fetch trip owner information
    const tripOwner = await UserModel.get({ _id: trip.ownerId });
    if (!tripOwner) throw ERROR_KEYS.USER_NOT_FOUND;
    // Validate trip either allowed to book
    if (!getBookingValidity(trip)) throw ERROR_KEYS.TRIP_BOOKING_CLOSED;

    bookingData['memberId'] = user._id;
    bookingData['ownerId'] = tripOwner._id;
    let costing = {};
    // Fetch deposit status information and validate
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

    let existingBooking = await BookingModel.get({
      tripId: trip._id,
      memberId: finalBookingData['memberId'],
    });
    // Checks if booking already exists
    if (
      existingBooking &&
      ['approved', 'pending'].includes(existingBooking.status)
    )
      throw ERROR_KEYS.BOOKING_ALREADY_EXISTS;

    finalBookingData['status'] = 'pending';
    const status = getTripResourceValidity(trip, bookingData);
    if (status.rooms && status.addOns) throw ERROR_KEYS.TRIP_RESOURCES_FULL;
    await BookingModel.updateQuery(
      {
        tripId: trip._id,
        memberId: finalBookingData['memberId'],
      },
      finalBookingData,
      {
        upsert: true,
      }
    );
    if (!existingBooking)
      existingBooking = await BookingModel.getById({
        tripId: trip._id,
        memberId: finalBookingData['memberId'],
      });
    const filter = {
      tripId: existingBooking.tripId,
      memberId: existingBooking.memberId,
    };
    const memberPayload = {
      tripId: existingBooking.tripId,
      memberId: existingBooking.memberId,
      bookingId: existingBooking._id,
      isMember: existingBooking.status == 'approved',
      removeRequested: false,
      isActive: true,
      leftOn: -1,
      joinedOn: moment().unix(),
    };
    await MemberModel.update(filter, memberPayload, { upsert: true });
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

    booking['trip'] = trip;
    booking['awsUserId'] = tripOwner.awsUserId;
    if (trip?.autoAcceptBookingRequest) {
      await BookingController.bookingsAction(
        { action: 'approve' },
        bookingId,
        tripOwner
      );
    }
    return booking;
  }

  static async listBookings(filters, currentUser) {
    if (!currentUser) throw ERROR_KEYS.USER_NOT_FOUND;
    if (!filters.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const trip = await TripModel.getById(filters.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;

    if (!(await checkPermission(currentUser, trip, 'atteendees', 'view')))
      throw ERROR_KEYS.UNAUTHORIZED;

    const params = [{ $match: { tripId: Types.ObjectId(filters.tripId) } }];
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
    if (!(trip.ownerId.toString() === user._id.toString())) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const bookingList = BookingModel.list({
      filter: {
        tripId: Types.ObjectId(params.tripId),
      },
    });
    return bookingList;
  }

  static async bookingsAction(params, bookingId, user) {
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    if (!booking) throw ERROR_KEYS.BOOKING_NOT_FOUND;
    const trip = await TripModel.getById(booking?.tripId?.toString());
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    const tripUpdate = {
      spotsReserved: trip.spotsReserved - booking.attendees,
    };
    tripUpdate['spotsReserved'] =
      tripUpdate['spotsReserved'] < 0 ? 0 : tripUpdate['spotsReserved'];
    let validForUpdate = false;
    let bookingUpdate = {};
    const memberInfo = await UserModel.get({
      _id: booking.memberId,
    });
    const { action, forceAddTraveler } = params || {};
    if (action) {
      switch (action) {
        // host
        case 'approve':
          validForUpdate = true;
          if (
            !(await checkPermission(
              currentUser,
              trip,
              'travelerManagement',
              'edit'
            ))
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
                // await EmailSender(
                //   memberInfo,
                //   EmailMessages.BOOKING_REQUEST_ACCEPTED_TRAVELER,
                //   [trip._id.toString(), trip['title']]
                // );

                // host
                // await EmailSender(
                //   user,
                //   EmailMessages.BOOKING_REQUEST_ACCEPTED_HOST,
                //   [trip._id.toString(), trip['title'], memberInfo['firstName']]
                // );
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
          await MemberController.memberAction(
            {
              tripId: booking.tripId,
              action: 'addMember',
              message: '',
              memberIds: [booking.memberId],
            },
            user
          );

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
            !(await checkPermission(
              currentUser,
              trip,
              'travelerManagement',
              'edit'
            ))
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
          // await EmailSender(
          //   memberInfo,
          //   EmailMessages.BOOKING_REQUEST_DECLINED_TRAVELER,
          //   [trip._id.toString(), trip['title']]
          // );

          // host
          // await EmailSender(user, EmailMessages.BOOKING_REQUEST_DECLINED_HOST, [
          //   trip._id.toString(),
          //   trip['title'],
          //   memberInfo['firstName'],
          // ]);
          break;
        // guest
        case 'withdraw':
          validForUpdate = true;
          const tripOwner = await UserModel.get({ _id: trip.ownerId });
          if (!tripOwner) throw ERROR_KEYS.USER_NOT_FOUND;
          if (
            !(
              user.isAdmin ||
              booking.memberId?.toString() === user._id.toString()
            )
          ) {
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
          // await EmailSender(
          //   memberInfo,
          //   EmailMessages.BOOKING_REQUEST_WITHDRAWN_TRAVELER,
          //   [trip._id.toString(), trip['title']]
          // );

          // host
          // await EmailSender(
          //   tripOwner,
          //   EmailMessages.BOOKING_REQUEST_WITHDRAWN_HOST,
          //   [trip._id.toString(), trip['title'], memberInfo['firstName']]
          // );
          break;

        default:
          throw ERROR_KEYS.INVALID_ACTION;
      }
    }
    if (validForUpdate) await TripModel.update(trip._id, tripUpdate);
    return 'success';
  }

  static async getBooking(bookingId) {
    return await BookingModel.getById(bookingId);
  }

  static async doPartPayment(bookingId, user) {
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.getById(bookingId);
    const memberInfo = await UserModel.get({
      _id: booking.memberId,
    });

    if (user._id.toString() === booking?.memberId?.toString()) {
      if (booking.totalFare && booking.totalFare > 0) {
        if (booking.status !== 'approved' && booking.currentDue <= 0) {
          console.log('Request already processed');
          throw ERROR_KEYS.INVALID_ACTION;
        }
        const tripInfo = await TripModel.get({
          _id: booking.tripId,
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
        ...bookingProjection,
        tripId: {
          $toObjectId: '$tripId',
        },
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
  static async sendCustomMessage(params, currentUser) {
    if (!currentUser) throw ERROR_KEYS.USER_NOT_FOUND;
    const trip = await TripModel.get({
      _id: Types.ObjectId(params.tripId),
    });
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    if (
      await checkPermission(currentUser, trip, 'travelerManagement', 'edit')
    ) {
      const user = await UserModel.get({
        _id: Types.ObjectId(params.memberId),
      });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      await sendCustomEmail(
        user,
        EmailMessages.MEMBER_REMINDER_CUSTOM_MESSAGE_HOST,
        [params.message]
      );
      return 'success';
    } else throw ERROR_KEYS.UNAUTHORIZED;
  }
  static async getInvites(awsUserId, tripId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const booking = await BookingModel.get({
      memberId: user._id,
      tripId: Types.ObjectId(tripId),
    });
    return booking;
  }
  static async respondInvite(tripId, params, user) {
    const trip = await TripModel.getById(tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    let payload = {
      onwerId: trip.ownerId,
      memberId: user._id,
      tripId: trip._id,
      addedByHost: false,
      message: '',
      tripPaymentType: trip.tripPaymentType,
      status: params?.status,
    };
    if (trip.autoRegisterRSVP && params?.status === 'invite-accepted') {
      payload['status'] = 'approved';
      payload['message'] = 'Member auto accepted via rsvp.';
    }

    await BookingModel.updateQuery(
      { tripId: trip._id, memberId: user._id },
      payload,
      { upsert: true }
    );

    if (trip.autoRegisterRSVP && params?.status === 'invite-accepted') {
      const booking = await BookingModel.get({
        tripId: trip._id,
        memberId: user._id,
      });
      await MemberModel.update(
        { tripId: trip._id, memberId: user._id },
        { isActive: true, isMember: true, bookingId: booking._id },
        { upsert: true }
      );
      await MemberController.memberAction(
        {
          memberIds: [user._id.toString()],
          tripId: tripId,
          message: params?.message || '',
          action: 'addMember',
        },
        user
      );
    }
    return 'success';
  }
}
