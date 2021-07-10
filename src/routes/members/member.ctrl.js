/**
 * @name - Member controller
 * @description - This will handle business logic for members
 */
import { Types } from 'mongoose';
import _ from 'lodash';
import moment from 'moment';
import {
  MemberModel,
  TripModel,
  ConversationModel,
  UserModel,
  MessageModel,
  BookingModel,
} from '../../models';
import { dbConnect, logActivity } from '../../utils';
import { prepareSortFilter } from '../../helpers';
import { APP_CONSTANTS, ERROR_KEYS, LogMessages } from '../../constants';

export class MemberController {
  static async list(filter) {
    try {
      const filterParams = {
        tripId: Types.ObjectId(filter.tripId),
        isMember: true,
      };
      await dbConnect();
      const params = [{ $match: filterParams }];
      params.push({
        $lookup: {
          from: 'users',
          localField: 'memberId',
          foreignField: '_id',
          as: 'user',
        },
      });
      params.push({
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      });
      params.push({
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', '$user'] },
        },
      });
      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'username'],
          'updatedAt'
        ),
      });
      params.push({
        $project: {
          firstName: 1,
          lastName: 1,
          avatarUrl: 1,
          username: 1,
          updatedAt: 1,
          awsUserId: 1,
          isMember: 1,
          bookingId: {
            $toObjectId: '$bookingId',
          },
          tripId: 1,
          joinedOn: 1,
          memberId: 1,
          removeRequested: 1,
        },
      });
      if (filter['includeBooking']) {
        params.push({
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking',
          },
        });
        params.push({
          $unwind: {
            path: '$booking',
            preserveNullAndEmptyArrays: true,
          },
        });
      }
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $limit: limit });
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });

      const result = await MemberModel.aggregate(params);
      const resultCount = await MemberModel.count(filterParams);
      return {
        data: result,
        count: result.length,
        totalCount: resultCount,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async markForRemove(params, remove_requested) {
    return MemberModel.update(params, {
      removeRequested: remove_requested,
    });
  }
  static async memberAction(params) {
    try {
      const {
        memberIds,
        tripId,
        message,
        awsUserId,
        forceAddTraveller,
        action,
      } = params || {
        memberIds: [],
      };
      if (memberIds.length > 0) {
        await dbConnect();
        const user = await UserModel.get({
          awsUserId: awsUserId,
        });
        const objTripId = Types.ObjectId(tripId);
        const trip = await TripModel.getById(objTripId);
        if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
        if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
        const isOwner = trip.ownerId == user._id.toString();
        let guestCount = trip['guestCount'] || 0;
        const actions = memberIds.map(async memberId => {
          const query = { $or: [] };
          if (Types.ObjectId.isValid(memberId))
            query['$or'].push({ _id: Types.ObjectId(memberId) });
          query['$or'].push({ username: memberId });
          const memberDetails = await UserModel.get(query);
          if (memberDetails) {
            const updateParams = {
              memberId: memberDetails._id.toString(),
              tripId: objTripId,
            };
            const memberExists = await MemberModel.get({
              memberId: memberDetails._id,
              tripId: objTripId,
              isMember: true,
            });
            switch (action) {
              case 'addMember':
                if (isOwner || user.isAdmin === true) {
                  if (trip.spotsAvailable <= 0 && !forceAddTraveller) {
                    return Promise.reject(ERROR_KEYS.TRIP_IS_FULL_HOST);
                  }
                  if (params['bookingId']) {
                    updateParams['bookingId'] = params['bookingId'];
                    const booking = await BookingModel.getById(
                      params['bookingId']
                    );
                    if (booking && booking.attendees > 1) {
                      guestCount = guestCount + booking.attendees - 1;
                    }
                  } else {
                    const bookingInfo = {
                      currency: 'US',
                      addOns: [],
                      guests: [],
                      status: 'approved',
                      totalBaseFare: 0,
                      totalAddonFare: 0,
                      discountBaseFare: 0,
                      discountAddonFare: 0,
                      totalFare: 0,
                      currentDue: 0,
                      paidAmout: 0,
                      pendingAmout: 0,
                      paymentHistory: [],
                      tripId: tripId,
                      attendees: 1,
                      tripPaymentType: trip.tripPaymentType,
                      addedByHost: true,
                      message: 'Member added by Host',
                      memberId: memberDetails._id.toString(),
                    };
                    await BookingModel.addOrUpdate(
                      {
                        memberId: memberDetails._id.toString(),
                        tripId: tripId,
                        status: { $in: ['pending', 'approved'] },
                      },
                      bookingInfo
                    );
                    const booking_res = await BookingModel.get({
                      memberId: memberDetails._id.toString(),
                      tripId: tripId,
                      status: 'approved',
                    });
                    updateParams['bookingId'] = booking_res._id.toString();
                  }
                  updateParams['removeRequested'] = false;
                  updateParams['leftOn'] = -1;
                  updateParams['isMember'] = true;
                  updateParams['joinedOn'] = moment().unix();

                  // Message update
                  const messageParams = {
                    tripId: trip._id.toString(),
                    message:
                      memberDetails['firstName'] + ' has joined the group',
                    messageType: 'info',
                    isGroupMessage: true,
                    fromMemberId: user._id.toString(),
                    isRead: true,
                  };
                  await MessageModel.create(messageParams);

                  // conversation update
                  const memberAddDetails = {
                    memberId: memberDetails._id.toString(),
                    tripId: trip._id.toString(),
                    message:
                      memberDetails['firstName'] + ' has joined the group',
                    messageType: 'info',
                    isGroup: true,
                  };
                  // update to actionable member
                  await ConversationModel.addOrUpdate(
                    {
                      tripId: tripId,
                      memberId: memberDetails._id.toString(),
                    },
                    {
                      ...memberAddDetails,
                      joinedOn: moment().unix(),
                      isArchived: false,
                    }
                  );
                  delete memberAddDetails['memberId'];
                  delete memberAddDetails['tripId'];
                  // update to all the members
                  await ConversationModel.addOrUpdate(
                    {
                      tripId: tripId,
                    },
                    memberAddDetails
                  );

                  await logActivity({
                    ...LogMessages.TRAVELLER_ADDED_IN_TRIP_BY_HOST(
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [memberDetails._id.toString()],
                    userId: user._id.toString(),
                  });
                } else {
                  return Promise.reject('Access denied');
                }
                break;
              case 'removeMember':
                if (
                  isOwner ||
                  user.isAdmin == true ||
                  memberDetails._id.toString() == user._id.toString()
                ) {
                  console.log('Inside member info');
                  const bookingStatus = {};
                  if (memberDetails._id.toString() == user._id.toString()) {
                    bookingStatus['status'] = 'cancelled';
                  } else {
                    bookingStatus['status'] = 'removed';
                  }
                  bookingStatus['reason'] = message;
                  if (memberExists && memberExists['bookingId']) {
                    await BookingModel.update(
                      Types.ObjectId(memberExists['bookingId']),
                      bookingStatus
                    );
                    const booking = await BookingModel.getById(
                      memberExists['bookingId']
                    );
                    if (booking && booking.attendees > 1) {
                      guestCount = guestCount - booking.attendees - 1;
                    }
                  }
                  updateParams['isMember'] = false;
                  updateParams['leftOn'] = moment().unix();
                  // conversation update
                  if (memberExists) {
                    // Message update
                    const messageParams = {
                      tripId: trip._id.toString(),
                      message:
                        memberDetails['firstName'] + ' has left the group',
                      messageType: 'info',
                      isGroupMessage: true,
                      isRead: true,
                      fromMemberId: user._id.toString(),
                    };
                    await MessageModel.create(messageParams);
                    // Conversation update
                    const memberRemoveDetails = {
                      message:
                        memberDetails['firstName'] + ' has left the group',
                      messageType: 'info',
                      isRead: false,
                    };
                    // update to actionable member
                    await ConversationModel.addOrUpdate(
                      {
                        tripId: tripId,
                        memberId: memberDetails._id.toString(),
                      },
                      {
                        ...memberRemoveDetails,
                        isRead: true,
                        leftOn: moment().unix(),
                        isArchived: true,
                      }
                    );
                    // update to all the members
                    await ConversationModel.addOrUpdate(
                      {
                        tripId: tripId,
                      },
                      memberRemoveDetails
                    );
                  }
                  await logActivity({
                    ...LogMessages.BOOKING_REQUEST_DECLINE_HOST(
                      `${memberDetails.firstName} ${memberDetails.lastName}`,
                      trip['title']
                    ),
                    tripId: trip._id.toString(),
                    audienceIds: [user._id.toString()],
                    userId: user._id.toString(),
                  });
                } else {
                  console.log('Inside rejection');
                  return Promise.reject();
                }
                break;
              case 'makeFavorite':
                updateParams['isFavorite'] = true;
                updateParams['favoriteOn'] = moment().unix();
                break;
              case 'makeUnFavorite':
                updateParams['isFavorite'] = false;
                updateParams['unFavoriteOn'] = moment().unix();
                break;
            }
            return MemberModel.update(
              {
                memberId: memberDetails._id,
                tripId: objTripId,
              },
              updateParams,
              { upsert: true }
            );
          } else {
            console.log('Inside MEMBER_NOT_FOUND info');
            return Promise.reject(ERROR_KEYS.MEMBER_NOT_FOUND);
          }
        });
        try {
          await Promise.all(actions);
        } catch (err) {
          console.log(err);
          if (err && err.type) throw err;
          else throw ERROR_KEYS.UNAUTHORIZED;
        }

        const memberCount = await MemberModel.count({
          tripId: objTripId,
          isMember: true,
        });
        const favoriteCount = await MemberModel.count({
          tripId: objTripId,
          isFavorite: true,
        });

        let maxGroupSize = trip['maxGroupSize'];
        const totalMemberCount = guestCount + memberCount;
        if (maxGroupSize - totalMemberCount < 0) {
          maxGroupSize = totalMemberCount;
        }
        const updateTrip = {
          maxGroupSize: maxGroupSize,
          spotsFilled: totalMemberCount,
          spotsAvailable: maxGroupSize - totalMemberCount,
          groupSize: totalMemberCount,
          isFull: totalMemberCount >= maxGroupSize,
          favoriteCount: favoriteCount,
          spotFilledRank: Math.round((totalMemberCount / maxGroupSize) * 100),
        };
        await TripModel.update(objTripId, updateTrip);
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
