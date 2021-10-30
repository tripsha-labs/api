import { UserModel, TripModel, MemberModel } from '../models';
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
