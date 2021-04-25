import { dbConnect } from '../utils';
import { UserModel, TripModel } from '../models';

export const updateProfilePic = async (skip = 0) => {
  await dbConnect();
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
      if (bucketUrl && user.avatarUrl.indexOf('https://') === -1) {
        const avatarUrl = `https://${bucketUrl}.s3.amazonaws.com/private/${user.awsUserId}/${user.avatarUrl}`;
        await UserModel.update({ _id: user._id }, { avatarUrl: avatarUrl });
      }
    });
  }
  if (users && users.length === 1000) updateProfilePic(skip + 1000);
  return 'success';
};

export const updateTripUrl = async (skip = 0) => {
  await dbConnect();
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
        await TripModel.update({ _id: trip._id }, trip);
      }
    });
  }
  if (trips && trips.length === 1000) updateTripUrl(skip + 1000);
  return 'success';
};
