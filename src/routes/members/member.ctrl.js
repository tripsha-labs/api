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
  InvoiceItemModel,
  InvoiceModel,
} from '../../models';
import { logActivity } from '../../utils';
import { ERROR_KEYS, LogMessages } from '../../constants';
import {
  addAddonResources,
  addRoomResources,
  removeAddonResources,
  removeRoomResources,
} from '../../helpers';
// import { checkPermission } from '../../helpers/db-helper';

export class MemberController {
  static async markForRemove(params, remove_requested) {
    return MemberModel.update(params, {
      removeRequested: remove_requested,
    });
  }
  static async memberAction(
    { memberIds, tripId, message, action },
    currentUser
  ) {
    const user = currentUser;
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const trip = await TripModel.getById(tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;

    try {
      const bookingIds = [];
      const objTripId = Types.ObjectId(tripId);
      if (memberIds && memberIds.length > 0) {
        const tripUpdate = {};
        let guestCount = trip['guestCount'] || 0;
        // Process member one by one
        const actions = memberIds.map(async memberId => {
          // Get member information
          const memberDetails = await UserModel.get({
            _id: Types.ObjectId(memberId),
          });
          const tripOwner = await UserModel.get({
            _id: trip?.ownerId,
          });
          if (!memberDetails)
            return Promise.reject(ERROR_KEYS.MEMBER_NOT_FOUND);

          // payload for update member
          const updateParams = {
            memberId: memberDetails._id,
            tripId: objTripId,
          };
          // check if member already exists in the database
          const memberExists = await MemberModel.get(updateParams);
          switch (action) {
            case 'addMember':
              const booking = await BookingModel.get({
                memberId: memberDetails._id,
                tripId: objTripId,
              });
              if (!booking) return Promise.reject(ERROR_KEYS.BOOKING_NOT_FOUND);
              if (booking?.attendees > 1) {
                guestCount = guestCount + booking.attendees - 1;
              }
              // Handle rooms calculation
              if (booking.rooms?.length > 0) {
                tripUpdate['rooms'] = addRoomResources(booking, trip, [
                  'filled',
                ]);
              }
              // Handle addons calculation
              if (booking.addOns?.length > 0) {
                tripUpdate['addOns'] = addAddonResources(booking, trip, [
                  'filled',
                ]);
              }

              // Message update
              const messageParams = {
                tripId: trip._id.toString(),
                message: memberDetails['firstName'] + ' has joined the group',
                messageType: 'info',
                isGroupMessage: true,
                fromMemberId: trip.ownerId.toString(),
                isRead: true,
              };
              await MessageModel.create(messageParams);

              // Add biiling entry
              const invoice = await InvoiceModel.findOrInsert(trip.ownerId);
              const invoiceItems = await InvoiceItemModel.find({
                tripId: objTripId,
                memberId: memberDetails._id,
              });
              const count = {
                guestCount: 0,
              };
              if (invoiceItems.length > 0) {
                const currentMonthItem = invoiceItems.find(
                  ii => ii.invoiceId.toString() == invoice._id.toString()
                );
                let totalGuestCount = 0;
                // get the previous guest count
                if (invoiceItems.length > 1) {
                  invoiceItems.forEach(ii => {
                    totalGuestCount += ii.guestCount;
                  });
                }
                const newGuestCount = booking.attendees - 1;
                if (totalGuestCount < newGuestCount) {
                  const currentMonthCount =
                    newGuestCount -
                      totalGuestCount +
                      currentMonthItem?.guestCount || 0;
                  count['guestCount'] =
                    currentMonthCount >= 0 ? currentMonthCount : 0;
                }
                if (count?.guestCount > 0)
                  await InvoiceItemModel.updateOne(
                    {
                      tripId: objTripId,
                      memberId: memberDetails._id,
                      invoiceId: invoice._id,
                    },
                    {
                      $set: count,
                      $setOnInsert: {
                        tripId: objTripId,
                        memberId: memberDetails._id,
                        tripOwnerId: trip.ownerId,
                        invoiceId: invoice._id,
                      },
                    },
                    {
                      upsert: true,
                    }
                  );
              } else {
                count['travelerCount'] = 1;
                if (booking.attendees > 1) {
                  count['guestCount'] = booking.attendees - 1;
                }
                await InvoiceItemModel.create({
                  tripId: objTripId,
                  memberId: memberDetails._id,
                  tripOwnerId: trip.ownerId,
                  invoiceId: invoice._id,
                  ...count,
                });
              }

              // conversation update
              const memberAddDetails = {
                memberId: memberDetails._id.toString(),
                tripId: trip._id.toString(),
                message: memberDetails['firstName'] + ' has joined the group',
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

              // await logActivity({
              //   ...LogMessages.TRAVELER_ADDED_IN_TRIP_BY_HOST(trip['title']),
              //   tripId: trip._id.toString(),
              //   audienceIds: [memberDetails._id.toString()],
              //   userId: user._id.toString(),
              // });
              break;
            case 'removeMember':
              const bookingStatus = {};
              if (memberDetails._id.toString() == user._id.toString()) {
                bookingStatus['status'] = 'canceled';
              } else {
                bookingStatus['status'] = 'removed';
              }
              bookingStatus['reason'] = message;
              if (memberExists?.bookingId) {
                bookingIds.push(memberExists.bookingId);
                const booking = await BookingModel.getById(
                  memberExists.bookingId.toString()
                );
                if (booking) {
                  await BookingModel.update(booking._id, bookingStatus);
                  if (booking?.attendees > 1) {
                    guestCount = guestCount - (booking.attendees - 1);
                    guestCount = guestCount < 0 ? 0 : guestCount;
                  }
                  if (booking?.rooms?.length > 0) {
                    tripUpdate['rooms'] = removeRoomResources(booking, trip, [
                      'filled',
                      'reserved',
                    ]);
                  }
                  if (booking?.addOns?.length > 0) {
                    tripUpdate['addOns'] = removeAddonResources(booking, trip, [
                      'filled',
                      'reserved',
                    ]);
                  }
                }
              }
              updateParams['isActive'] =
                memberExists?.isFavorite || memberExists?.isInvite;
              updateParams['isMember'] = false;
              updateParams['leftOn'] = moment().unix();
              // conversation update
              if (memberExists) {
                // Message update
                const messageParams = {
                  tripId: trip._id.toString(),
                  message: memberDetails['firstName'] + ' has left the group',
                  messageType: 'info',
                  isGroupMessage: true,
                  isRead: true,
                  fromMemberId: user._id.toString(),
                };
                await MessageModel.create(messageParams);
                // Conversation update
                const memberRemoveDetails = {
                  message: memberDetails['firstName'] + ' has left the group',
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
              const trip_url = `${
                process.env.CLIENT_BASE_URL
              }/trip/${trip._id.toString()}`;
              const tripName = `<a href="${trip_url}">${trip['title']}</a>`;

              // traveler
              if (memberDetails._id.toString() == user._id.toString()) {
                await sendNotifications(
                  'trip_canceled_by traveler_traveler',
                  memberDetails,
                  [memberDetails?._id],
                  trip._id,
                  {
                    emailParams: {
                      TripName: tripName,
                    },
                    messageParams: {
                      TripName: tripName,
                    },
                  }
                );
                // host
                const travelerName = `${memberDetails?.firstName ||
                  ''} ${memberDetails?.lastName || ''}`;
                await sendNotifications(
                  'trip_canceled_by traveler_host',
                  tripOwner,
                  [tripOwner?._id],
                  trip._id,
                  {
                    emailParams: {
                      TripName: tripName,
                      TravelerName: travelerName,
                    },
                    messageParams: {
                      TripName: tripName,
                      TravelerName: travelerName,
                    },
                  }
                );
              }
              break;
            case 'makeFavorite':
              updateParams['isFavorite'] = true;
              updateParams['isActive'] = true;
              updateParams['favoriteOn'] = moment().unix();
              break;
            case 'makeUnFavorite':
              updateParams['isFavorite'] = false;
              updateParams['unFavoriteOn'] = moment().unix();
              updateParams['isActive'] =
                memberExists?.isMember || memberExists?.isInvite;
              break;
            default:
            // no action
          }
          if (action !== 'addMember') {
            await MemberModel.update(
              { memberId: memberDetails._id, tripId: objTripId },
              updateParams,
              { upsert: true }
            );
          }
          return Promise.resolve();
        });
        // Cleanup resources
        // TODO: remove any other resources depends on member
        if (bookingIds?.length > 0) {
          await BookingResource.deleteMany({
            bookingId: {
              $in: bookingIds,
            },
            tripId: objTripId,
          });
        }
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
