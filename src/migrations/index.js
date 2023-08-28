import { Types, isValidObjectId } from 'mongoose';
import {
  UserModel,
  TripModel,
  MemberModel,
  BookingModel,
  HostRequestModel,
  TopicModel,
} from '../models';
import { ERROR_KEYS, APP_CONSTANTS } from '../constants';
import uuid from 'uuid/v4';
export const updateProfilePic = async (skip = 0) => {
  const params = {
    filter: {},
    select: { awsUserId: 1, avatarUrl: 1 },
    pagination: { limit: 1000, skip: skip },
  };
  const users = await UserModel.list(params);

  if (users && users.length > 0) {
    users.map(async user => {
      let bucketUrl = '';
      switch (process.env.ENV) {
        case 'staging':
          bucketUrl = 'tripsha-app-api-staging-attachmentsbucket-1659jilwr9rld';
          break;
        case 'prod-api':
          bucketUrl =
            'tripsha-app-api-prod-api-attachmentsbucket-183v474nekkjk';
          break;
      }
      if (
        bucketUrl &&
        user.avatarUrl &&
        user.avatarUrl.indexOf('https://') === -1
      ) {
        const avatarUrl = `https://${bucketUrl}.s3.amazonaws.com/private/${user.awsUserId}/${user.avatarUrl}`;
        await UserModel.update({ _id: user._id }, { avatarUrl: avatarUrl });
      }
    });
  }
  if (users && users.length === 1000) updateProfilePic(skip + 1000);
  return 'success';
};

export const updateTripUrl = async (skip = 0) => {
  const params = [
    {
      $lookup: {
        from: 'users',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'User',
      },
    },
    {
      $unwind: {
        path: '$User',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        pictureUrls: 1,
        'User.awsUserId': 1,
        itineraries: 1,
      },
    },
  ];
  if (skip > 0) {
    params.push({
      $skip: skip,
    });
  }
  params.push({
    $limit: 1000,
  });

  const trips = await TripModel.aggregate(params);

  if (trips && trips.length > 0) {
    trips.map(async trip => {
      let bucketUrl = '';
      switch (process.env.ENV) {
        case 'staging':
          bucketUrl = 'tripsha-app-api-staging-attachmentsbucket-1659jilwr9rld';
          break;
        case 'prod-api':
          bucketUrl =
            'tripsha-app-api-prod-api-attachmentsbucket-183v474nekkjk';
          break;
      }
      let updateRequired = false;
      if (bucketUrl) {
        if (trip.pictureUrls && trip.pictureUrls.length > 0) {
          trip.pictureUrls.map((url, index) => {
            if (url.indexOf('https://') === -1) {
              updateRequired = true;
              const avatarUrl = `https://${bucketUrl}.s3.amazonaws.com/private/${trip.User.awsUserId}/${url}`;
              trip.pictureUrls[index] = avatarUrl;
            }
          });
        }
        if (trip.itineraries && trip.itineraries.length > 0) {
          trip.itineraries.map((itenery, index) => {
            if (
              itenery.imageUrl &&
              itenery.imageUrl.indexOf('https://') === -1
            ) {
              updateRequired = true;
              const avatarUrl = `https://${bucketUrl}.s3.amazonaws.com/private/${trip.User.awsUserId}/${itenery.imageUrl}`;
              trip.itineraries[index].imageUrl = avatarUrl;
            }
          });
        }
      }
      if (updateRequired) {
        await TripModel.update(trip._id, trip);
      }
    });
  }
  if (trips && trips.length === 1000) updateTripUrl(skip + 1000);
  return 'success';
};

export const updateTripStats = async (skip = 0) => {
  const params = [];
  if (skip > 0) {
    params.push({
      $skip: skip,
    });
  }
  params.push({
    $limit: 1000,
  });
  console.log(params);
  const trips = await TripModel.aggregate(params);
  const promises = [];
  if (trips && trips.length > 0) {
    trips.map(trip => {
      promises.push(
        new Promise(async resolve => {
          try {
            const memberCount = await MemberModel.count({
              tripId: trip._id,
              isMember: true,
              isOwner: { $ne: true },
            });
            const guestCount = trip['guestCount'] || 0;
            const externalCount = trip['externalCount'] || 0;
            const totalMemberCount = externalCount + memberCount + guestCount;
            const updateTrip = {};
            let maxGroupSize = trip['maxGroupSize'];
            if (totalMemberCount > maxGroupSize) {
              maxGroupSize = totalMemberCount;
            }
            updateTrip['maxGroupSize'] = maxGroupSize;
            updateTrip['guestCount'] = guestCount;
            updateTrip['groupSize'] = totalMemberCount;
            updateTrip['spotsFilled'] = totalMemberCount;
            updateTrip['spotsAvailable'] = maxGroupSize - totalMemberCount;
            updateTrip['spotFilledRank'] = Math.round(
              (totalMemberCount / maxGroupSize) *
                APP_CONSTANTS.SPOTSFILLED_PERCEENT
            );
            updateTrip['isFull'] = totalMemberCount >= maxGroupSize;
            console.log(updateTrip);
            await TripModel.update(trip._id, updateTrip);
          } catch (err) {
            console.log(err);
          } finally {
            return resolve();
          }
        })
      );
    });
  }
  await Promise.all(promises);
  if (trips && trips.length === 1000) updateTripStats(skip + 1000);
};

export const updateBookingOptions = async () => {
  const params = [];
  params.push({
    $match: {
      'rooms.variants': { $exists: false },
      'rooms.cost': { $exists: true },
    },
  });
  params.push({
    $limit: 1000,
  });
  const trips = await TripModel.aggregate(params);
  const promises = [];
  trips.map(trip => {
    promises.push(
      new Promise(async resolve => {
        try {
          const updateTrip = {};
          let roomName = '';
          if (trip['rooms'] && trip['rooms'].length > 0) {
            roomName = trip['rooms'][0].name;
          }
          updateTrip['rooms'] = [
            {
              id: uuid(),
              name: roomName,
              variants: trip['rooms'],
            },
          ];
          await TripModel.update(trip._id, updateTrip);
        } catch (err) {
          console.log(err);
        } finally {
          return resolve();
        }
      })
    );
  });
  await Promise.all(promises);
  if (trips && trips.length === 1000) updateBookingOptions();
};

export const updateTripsForReservedCount = async () => {
  const params = [];
  params.push({
    $match: {
      tripPaymentType: 'pay',
      $or: [
        {
          $and: [
            { 'rooms.variants': { $exists: true, $not: { $size: 0 } } },
            { 'rooms.variants.reserved': { $exists: false } },
          ],
        },
        {
          $and: [
            { addOns: { $exists: true, $not: { $size: 0 } } },
            { 'addOns.reserved': { $exists: false } },
          ],
        },
      ],
    },
  });
  params.push({
    $limit: 100,
  });
  const trips = await TripModel.aggregate(params);
  const promises = [];
  trips.map(trip => {
    promises.push(
      new Promise(async resolve => {
        try {
          const bookingParams = [
            {
              $match: {
                tripId: trip._id.toString(),
                status: { $in: ['pending'] },
              },
            },
          ];
          const bookings = await BookingModel.aggregate(bookingParams);
          const rooms = {};
          const addOns = {};
          bookings.map(booking => {
            booking.rooms &&
              booking.rooms.map(room => {
                rooms[
                  `${room.variant.id}_${room.room.id}`
                ] = rooms.hasOwnProperty(`${room.variant.id}_${room.room.id}`)
                  ? rooms[`${room.variant.id}_${room.room.id}`] + room.attendees
                  : room.attendees;
                return room;
              });
            booking.addOns &&
              booking.addOns.map(addOn => {
                addOns[addOn.id] = addOns.hasOwnProperty(addOn.id)
                  ? addOns[addOn.id] + room.attendees
                  : room.attendees;
                return room;
              });
            return booking;
          });
          const updateTrip = {};
          updateTrip['rooms'] =
            trip.rooms &&
            trip.rooms.map(room => {
              room['variants'] =
                room.variants &&
                room.variants.map(variant => {
                  if (rooms.hasOwnProperty(`${variant.id}_${room.id}`))
                    variant['reserved'] =
                      (variant['filled'] || 0) +
                      rooms[`${variant.id}_${room.id}`];
                  else variant['reserved'] = variant['filled'] || 0;
                  return variant;
                });
              return room;
            });
          updateTrip['addOns'] =
            trip.addOns &&
            trip.addOns.map(addOn => {
              if (addOns.hasOwnProperty(addOn.id))
                addOn['reserved'] = (addOn['filled'] || 0) + addOns[addOn.id];
              else addOn['reserved'] = addOn['filled'] || 0;
              return addOn;
            });
          await TripModel.update(trip._id, updateTrip);
        } catch (err) {
          console.log(err);
        } finally {
          return resolve();
        }
      })
    );
  });
  await Promise.all(promises);
  if (trips && trips.length === 100) updateTripsForReservedCount();
};

export const updateVariableNames = async () => {
  return new Promise(async resolve => {
    await BookingModel.updateMany(
      {},
      { $rename: { pendingAmout: 'pendingAmount' } },
      { multi: true }
    );
    await HostRequestModel.updateMany(
      {},
      { $rename: { targettingTypesOfTravelers: 'targetingTypesOfTravelers' } },
      { multi: true }
    );
    resolve();
  });
};

export const updateObjectIds = async () => {
  try {
    // const bookings = await BookingModel.list({});
    // let payload = bookings.map(booking => {
    //   return {
    //     updateOne: {
    //       filter: {
    //         _id: booking._id,
    //       },
    //       update: {
    //         $set: {
    //           tripId: Types.ObjectId(booking.tripId),
    //           memberId: Types.ObjectId(booking.memberId),
    //           onwerId: Types.ObjectId(booking.onwerId),
    //         },
    //       },
    //       upsert: false,
    //     },
    //   };
    // });
    // await BookingModel.bulkWrite(payload);
    // const members = await MemberModel.list({});
    // payload = members.map(member => {
    //   if (
    //     member.bookingId &&
    //     typeof member.bookingId == 'string' &&
    //     isValidObjectId(member.bookingId)
    //   )
    //     return {
    //       updateOne: {
    //         filter: {
    //           _id: member._id,
    //         },
    //         update: {
    //           $set: {
    //             bookingId: Types.ObjectId(member.bookingId),
    //           },
    //         },
    //         upsert: false,
    //       },
    //     };
    //   else
    //     return {
    //       updateOne: {
    //         filter: {
    //           _id: member._id,
    //         },
    //         update: {
    //           $set: { isInvite: false },
    //         },
    //         upsert: false,
    //       },
    //     };
    // });
    // await MemberModel.bulkUpdate(payload);
    // await UserModel.updateMany({}, { $set: { isConcierge: true } });
    // // await TripModel.delete({ _id: Types.ObjectId('6487565a854493000850ac16') });
    // // await TopicModel.deleteMany({
    // //   tripId: Types.ObjectId('6487565a854493000850ac16'),
    // // });
    // await MemberModel.deleteMany({ isOwner: true });
    // await MemberModel.updateMany(
    //   { isActive: { $exists: false } },
    //   { isActive: true }
    // );
  } catch (err) {
    console.log(err);
  }
};
