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
  BookingResource,
} from '../../models';
import { logActivity } from '../../utils';
import { ERROR_KEYS, LogMessages } from '../../constants';
import {
  addAddonResources,
  addRoomResources,
  removeAddonResources,
  removeRoomResources,
} from '../../helpers';

export class MemberController {
  static async markForRemove(params, remove_requested) {
    return MemberModel.update(params, {
      removeRequested: remove_requested,
    });
  }
  static async memberAction(params, currentUser) {
    try {
      const {
        memberIds,
        tripId,
        message,
        forceAddTraveler,
        action,
        autoRegisterRSVP,
      } = params || {
        memberIds: [],
      };
      const bookingIds = [];
      const objTripId = Types.ObjectId(tripId);
      if (memberIds.length > 0) {
        const user = currentUser;
        if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

        const tripUpdate = {};
        const trip = await TripModel.getById(objTripId);
        if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
        const coHosts = trip?.coHosts?.map(h => h.id);
        const isActionAllowed =
          trip.ownerId == user._id.toString() ||
          coHosts?.includes(user._id.toString()) ||
          user.isAdmin === true ||
          autoRegisterRSVP;

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
                if (isActionAllowed) {
                  if (trip.spotsAvailable <= 0 && !forceAddTraveler) {
                    return Promise.reject(ERROR_KEYS.TRIP_IS_FULL_HOST);
                  }
                  if (params['bookingId']) {
                    updateParams['bookingId'] = params['bookingId'];
                    const booking = await BookingModel.getById(
                      params['bookingId']
                    );
                    if (booking?.attendees > 1) {
                      guestCount = guestCount + booking.attendees - 1;
                    }
                    if (booking.rooms?.length > 0) {
                      tripUpdate['rooms'] = addRoomResources(booking, trip, [
                        'filled',
                      ]);
                    }
                    if (booking.addOns?.length > 0) {
                      tripUpdate['addOns'] = addAddonResources(booking, trip, [
                        'filled',
                      ]);
                    }
                  } else {
                    const bookingInfo = {
                      currency: 'US',
                      addOns: [],
                      rooms: [],
                      guests: [],
                      status: 'approved',
                      totalBaseFare: 0,
                      totalAddonFare: 0,
                      discountBaseFare: 0,
                      discountAddonFare: 0,
                      totalFare: 0,
                      currentDue: 0,
                      paidAmout: 0,
                      pendingAmount: 0,
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
                    ...LogMessages.TRAVELER_ADDED_IN_TRIP_BY_HOST(
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
                  isActionAllowed ||
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

                  if (memberExists?.bookingId) {
                    bookingIds.push(memberExists.bookingId);
                    await BookingModel.update(
                      Types.ObjectId(memberExists.bookingId),
                      bookingStatus
                    );
                    const booking = await BookingModel.getById(
                      memberExists.bookingId
                    );
                    if (booking?.attendees > 1) {
                      guestCount = guestCount - (booking.attendees - 1);
                      guestCount = guestCount < 0 ? 0 : guestCount;
                    }
                    if (booking.rooms?.length > 0) {
                      tripUpdate['rooms'] = removeRoomResources(booking, trip, [
                        'filled',
                        'reserved',
                      ]);
                    }
                    if (booking.addOns?.length > 0) {
                      tripUpdate['addOns'] = removeAddonResources(
                        booking,
                        trip,
                        ['filled', 'reserved']
                      );
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
            if (bookingIds?.length > 0) {
              await BookingResource.deleteMany({
                bookingId: { $in: bookingIds },
                tripId: objTripId,
              });
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
          isOwner: { $ne: true },
        });
        const favoriteCount = await MemberModel.count({
          tripId: objTripId,
          isFavorite: true,
        });
        let maxGroupSize = trip['maxGroupSize'];
        let externalCount = trip['externalCount'] || 0;
        const totalMemberCount = guestCount + memberCount + externalCount;
        if (maxGroupSize - totalMemberCount < 0) {
          maxGroupSize = totalMemberCount;
        }
        const updateTrip = {
          ...tripUpdate,
          guestCount: guestCount,
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
