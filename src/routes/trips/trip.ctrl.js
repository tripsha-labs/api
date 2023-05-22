/**
 * @name - Trip controller
 * @description - This will handle business logic for Trip module
 */
import moment from 'moment';
import { Types } from 'mongoose';
import _ from 'lodash';
import { bookingProjection, EmailSender, logActivity } from '../../utils';
import { prepareSortFilter } from '../../helpers';
import {
  TripModel,
  MemberModel,
  validateTripLength,
  UserModel,
  ConversationModel,
  MessageModel,
  BookingModel,
  AssetModel,
  AssetLinkModel,
  UserPermissionModel,
  TopicModel,
} from '../../models';
import {
  ERROR_KEYS,
  APP_CONSTANTS,
  LogMessages,
  EmailMessages,
  USER_BASIC_INFO,
} from '../../constants';
import {
  checkPermission,
  getTripsByPermissions,
} from '../../helpers/db-helper';
import { TopicController } from '../topics/topic.ctrl';
import { PermissionsController } from '../permissions/permissions.ctrl';

export class TripController {
  static async markForRemove(params, remove_requested) {
    return TripModel.update(params, {
      removeRequested: remove_requested,
    });
  }
  static async listTrips(filter, memberId) {
    try {
      let currentDate = parseInt(
        moment()
          .subtract(4, 'weeks')
          .format('YYYYMMDD')
      );
      const filterParams = {
        isActive: true,
        isPublic: true,
        status: { $in: ['published', 'completed'] },
        endDate: { $gte: currentDate },
      };
      if (filter.pastTrips) {
        currentDate = parseInt(moment().format('YYYYMMDD'));
        filterParams['endDate'] = { $lt: currentDate };
      }
      const multiFilter = [];
      if (filter.minGroupSize)
        multiFilter.push({
          minGroupSize: { $gte: parseInt(filter.minGroupSize) },
        });

      if (filter.maxGroupSize)
        multiFilter.push({
          maxGroupSize: { $lte: parseInt(filter.maxGroupSize) },
        });

      if (filter.minCost && filter.minCost > 0)
        multiFilter.push({
          cost: { $gte: parseInt(filter.minCost) },
        });

      if (filter.maxCost && filter.maxCost < 10000)
        multiFilter.push({
          cost: { $lte: parseInt(filter.maxCost) },
        });

      if (filter.minStartDate)
        multiFilter.push({
          startDate: filter.matchExactDate
            ? parseInt(filter.minStartDate)
            : { $gte: parseInt(filter.minStartDate) },
        });

      if (filter.maxEndDate)
        multiFilter.push({
          endDate: filter.matchExactDate
            ? filter.maxEndDate
            : { $lte: parseInt(filter.maxEndDate) },
        });

      if (filter.minTripLength)
        multiFilter.push({
          tripLength: { $gte: parseInt(filter.minTripLength) },
        });

      if (filter.maxTripLength)
        multiFilter.push({
          tripLength: { $lte: parseInt(filter.maxTripLength) },
        });

      if (filter.interests) {
        multiFilter.push({
          interests: { $in: filter.interests.split(',') },
        });
      }

      if (filter.destinations) {
        multiFilter.push({
          destinations: { $in: filter.destinations.split(',') },
        });
      }
      if (multiFilter.length > 0) filterParams['$and'] = multiFilter;
      const params = [{ $match: filterParams }];

      params.push({
        $sort: prepareSortFilter(
          filter,
          ['createdAt', 'startDate', 'spotsFilled'],
          'createdAt',
          -1
        ),
      });
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });
      params.push({ $limit: limit });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'ownerId',
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

      let resTrips = await TripModel.aggregate(params);
      if (memberId) {
        const tripIds = resTrips.map(trip => trip._id);
        const user = await UserModel.get({ awsUserId: memberId });
        if (user) {
          const memberParams = {
            filter: {
              tripId: { $in: tripIds },
              memberId: user._id,
              isFavorite: true,
            },
          };

          const members = await MemberModel.list(memberParams);
          const favoriteTripIds = members.map(member =>
            member.tripId.toString()
          );

          resTrips = resTrips.map(trip => {
            trip['isFavorite'] =
              _.indexOf(favoriteTripIds, trip._id.toString()) !== -1;
            return trip;
          });
        }
      }
      const resCount = await TripModel.count(filterParams);

      return {
        data: resTrips,
        totalCount: resCount,
        count: resTrips.length,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async createProject(payload) {
    try {
      const trip = await TripModel.create(payload);
      await TopicController.addDefaultTopics(trip._id, payload.ownerId);
      return trip;
    } catch (err) {}
  }
  /** Depricated */
  static async createTrip(params) {
    try {
      // Validate trip fields against the strict schema
      const tripLength = validateTripLength(
        params['startDate'],
        params['endDate']
      );

      if (
        tripLength <= 0 ||
        tripLength > APP_CONSTANTS.MAX_TRIP_LENGTH ||
        isNaN(tripLength)
      )
        throw ERROR_KEYS.INVALID_DATES;
      params['tripLength'] = tripLength + 1;

      const user = await UserModel.get({ awsUserId: params.ownerId });
      params['ownerId'] = user;
      const trip = await TripModel.create(params);
      try {
        const topics = [
          { title: 'Accommodation' },
          { title: 'Flights' },
          { title: 'Ground transport' },
          { title: 'Activities' },
          { title: 'Food & Beverage' },
          { title: 'Meeting/Work Space' },
          { title: 'Technology' },
          { title: 'Attendees & Guests' },
          { title: 'Swag' },
          { title: 'Travel Insurance' },
        ];
        const topicsPayload = topics.map(t => {
          t['tripId'] = trip._id;
          t['updatedBy'] = user._id;
          t['createdBy'] = user._id;
          return t;
        });
        await TopicModel.insertMany(topicsPayload);
        const urlList = [];
        if (trip?.pictureUrls?.length > 0) {
          urlList.concat(trip.pictureUrls);
        }
        if (trip?.rooms?.length > 0) {
          trip.rooms.map(room => {
            if (room?.pictureUrls?.length > 0) {
              urlList.concat(room.pictureUrls.map(url => url.url));
              return room;
            }
          });
        }
        if (trip?.itineraries?.length > 0) {
          urlList.concat(trip.itineraries.map(itr => itr.imageUrl));
        }
        const items = new Set(urlList);
        const assets = await AssetModel.find({
          filter: { url: { $in: [...items] } },
          select: { _id: 1 },
        });
        const assetLinks = assets.map(ast => {
          return {
            asset_id: ast._id,
            resource_id: trip._id,
            user_id: user._id,
            type: 'trip',
          };
        });
        await AssetLinkModel.insertMany(assetLinks);
      } catch (err) {
        console.log('Failed to created links', err);
      }
      const addMemberParams = {
        memberId: user._id.toString(),
        tripId: trip._id,
        isOwner: true,
        isMember: true,
        joinedOn: moment().unix(),
      };
      await MemberModel.create(addMemberParams);

      const conversationParams = {
        memberId: user._id.toString(),
        tripId: trip._id.toString(),
        joinedOn: moment().unix(),
        message: params['title'] + ' created by ' + user['firstName'],
        messageType: 'info',
        isGroup: true,
      };
      await ConversationModel.create(conversationParams);

      const messageParams = {
        tripId: trip._id.toString(),
        message: params['title'] + ' created by ' + user['firstName'],
        messageType: 'info',
        isGroupMessage: true,
        fromMemberId: user._id.toString(),
      };
      await MessageModel.create(messageParams);
      const tripMessage =
        params['status'] == 'draft'
          ? LogMessages.CREATE_DRAFT_TRIP_HOST
          : LogMessages.CREATE_TRIP_HOST;
      await logActivity({
        ...tripMessage(params['title']),
        tripId: trip._id.toString(),
        audienceIds: [user._id.toString()],
        userId: user._id.toString(),
      });
      // if (params['status'] === 'published') {
      //   try {
      //     await EmailSender(user, EmailMessages.TRIP_PUBLISHED, [
      //       trip['_id'],
      //       params['title'],
      //     ]);
      //   } catch (err) {
      //     console.log(err);
      //   }
      // }
      const memberCount = await MemberModel.count({
        tripId: trip._id,
        isMember: true,
        isOwner: { $ne: true },
      });

      const totalMemberCount = params['externalCount'] + memberCount;
      const updateTrip = {
        spotsFilled: totalMemberCount,
        spotsAvailable: params['maxGroupSize'] - totalMemberCount,
        groupSize: totalMemberCount,
        isFull: totalMemberCount >= params['maxGroupSize'],
        spotFilledRank: Math.round(
          (totalMemberCount / params['maxGroupSize']) *
            APP_CONSTANTS.SPOTSFILLED_PERCEENT
        ),
      };
      await TripModel.update(trip._id, updateTrip);
      return trip;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateTrip(tripId, trip, user) {
    try {
      const tripDetails = await TripModel.getById(tripId);
      if (!user) throw ERROR_KEYS.UNAUTHORIZED;
      if (!tripDetails) throw ERROR_KEYS.TRIP_NOT_FOUND;
      let module = 'trip';
      if (trip.hasOwnProperty('budget')) module = 'vendorPayments';
      if (trip.hasOwnProperty('questions')) module = 'questions';
      if (trip.hasOwnProperty('travelerViewName')) module = 'atteendees';
      if (trip.hasOwnProperty('travelerViews')) module = 'atteendees';
      if (!checkPermission(user, tripDetails, module, 'edit')) {
        throw ERROR_KEYS.UNAUTHORIZED;
      }
      const exustingMemberCount = await MemberModel.count({ tripId });
      if (exustingMemberCount > 1 && trip.status === 'draft') {
        throw ERROR_KEYS.CANNOT_CHANGE_TO_DRAFT;
      }
      if (
        trip['startDate'] &&
        trip['startDate'] != '' &&
        trip['endDate'] &&
        trip['endDate'] != ''
      ) {
        trip['startDate'] = parseInt(trip['startDate']);
        trip['endDate'] = parseInt(trip['endDate']);
        const tripLength = validateTripLength(
          trip['startDate'],
          trip['endDate']
        );

        if (
          tripLength <= APP_CONSTANTS.MIN_TRIP_LENGTH ||
          tripLength > APP_CONSTANTS.MAX_TRIP_LENGTH ||
          isNaN(tripLength)
        )
          throw ERROR_KEYS.INVALID_DATES;
        trip['tripLength'] = tripLength + 1;
      } else if (trip['startDate'] && trip['startDate'] != '') {
        trip['startDate'] = parseInt(trip['startDate']);
        const tripLength = validateTripLength(
          trip['startDate'],
          tripDetails['endDate']
        );

        if (
          tripLength <= APP_CONSTANTS.MIN_TRIP_LENGTH ||
          tripLength > APP_CONSTANTS.MAX_TRIP_LENGTH ||
          isNaN(tripLength)
        )
          throw ERROR_KEYS.INVALID_DATES;
        trip['tripLength'] = tripLength + 1;
      } else if (trip['endDate'] && trip['endDate'] != '') {
        trip['endDate'] = parseInt(trip['endDate']);
        const tripLength = validateTripLength(
          tripDetails['startDate'],
          trip['endDate']
        );

        if (
          tripLength <= APP_CONSTANTS.MIN_TRIP_LENGTH ||
          tripLength > APP_CONSTANTS.MAX_TRIP_LENGTH ||
          isNaN(tripLength)
        )
          throw ERROR_KEYS.INVALID_DATES;
        trip['tripLength'] = tripLength + 1;
      }

      const memberCount = await MemberModel.count({
        tripId: tripId,
        isMember: true,
        isOwner: { $ne: true },
      });
      const guestCount = tripDetails['guestCount'] || 0;
      const externalCount = trip.hasOwnProperty('externalCount')
        ? trip['externalCount']
        : tripDetails['externalCount'] || 0;
      const totalMemberCount = externalCount + memberCount + guestCount;
      const maxGroupSize = trip['maxGroupSize']
        ? trip['maxGroupSize']
        : tripDetails['maxGroupSize'];
      if (
        totalMemberCount > maxGroupSize &&
        tripDetails['status'] !== 'draft'
      ) {
        throw ERROR_KEYS.INVALID_ETERNAL_COUNT;
      }
      trip['guestCount'] = guestCount;
      trip['groupSize'] = totalMemberCount;
      trip['spotsFilled'] = totalMemberCount;
      trip['spotsAvailable'] = maxGroupSize - totalMemberCount;
      trip['spotFilledRank'] = Math.round(
        (totalMemberCount / maxGroupSize) * APP_CONSTANTS.SPOTSFILLED_PERCEENT
      );
      trip['isFull'] = totalMemberCount >= maxGroupSize;

      await TripModel.update(tripId, trip);
      try {
        let urlList = [];
        if (trip?.pictureUrls?.length > 0) {
          urlList = [...urlList, ...trip.pictureUrls];
        } else if (tripDetails?.pictureUrls?.length > 0) {
          urlList = [...urlList, ...tripDetails.pictureUrls];
        }
        if (trip?.rooms?.length > 0) {
          trip.rooms.map(room => {
            if (room?.pictureUrls?.length > 0) {
              urlList = [...urlList, ...room.pictureUrls.map(url => url.url)];
              return room;
            }
          });
        } else if (tripDetails?.rooms?.length > 0) {
          tripDetails.rooms.map(room => {
            if (room?.pictureUrls?.length > 0) {
              urlList = [...urlList, ...room.pictureUrls.map(url => url.url)];
              return room;
            }
          });
        }
        if (trip?.itineraries?.length > 0) {
          urlList = [...urlList, ...trip.itineraries.map(itr => itr.imageUrl)];
        } else if (tripDetails?.itineraries?.length > 0) {
          urlList = [
            ...urlList,
            ...tripDetails.itineraries.map(itr => itr.imageUrl),
          ];
        }
        const items = new Set(urlList);
        const assets = await AssetModel.list({
          filter: { url: { $in: [...items] } },
          select: { _id: 1 },
        });
        const assetLinks = assets.map(ast => {
          return {
            asset_id: ast._id,
            resource_id: tripDetails._id,
            user_id: user._id,
            type: 'trip',
          };
        });
        await AssetLinkModel.deleteMany({
          type: 'trip',
          user_id: user._id,
          resource_id: tripDetails._id,
        });
        await AssetLinkModel.insertMany(assetLinks);
      } catch (err) {
        console.log('Failed to create links', err);
      }
      const tripName = trip['title'] ? trip['title'] : tripDetails['title'];
      const logMessage =
        tripDetails['status'] == 'draft' && trip['status'] == 'published'
          ? LogMessages.TRIP_PUBLISHED
          : LogMessages.UPDATE_TRIP_HOST;
      await logActivity({
        ...logMessage(tripName),
        tripId: tripId,
        audienceIds: [user._id.toString()],
        userId: user._id.toString(),
      });
      // if (
      //   trip['status'] == 'published' &&
      //   tripDetails['status'] !== trip['status']
      // ) {
      //   try {
      //     await EmailSender(user, EmailMessages.TRIP_PUBLISHED, [
      //       tripId,
      //       tripName,
      //     ]);
      //     console.log('Email sent');
      //   } catch (err) {
      //     console.log(err);
      //   }
      // }
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async updateDraftTrip(tripId, trip, user) {
    try {
      if (!user) throw ERROR_KEYS.UNAUTHORIZED;
      const payload = {};
      Object.keys(trip).forEach(k => {
        payload[`draft.${k}`] = trip[k];
      });
      payload['lastSavedDate'] = moment().unix();
      payload['updatedBy'] = user._id;
      await TripModel.update(Types.ObjectId(tripId), payload);
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async publishTrip(tripId, payload, user) {
    try {
      if (!user) throw ERROR_KEYS.UNAUTHORIZED;
      payload['lastPublishedDate'] = moment().unix();
      payload['lastSavedDate'] = payload['lastPublishedDate'];
      payload['updatedBy'] = user._id;
      await TripModel.update(Types.ObjectId(tripId), payload);
    } catch (err) {
      throw err;
    }
  }

  static async getTrip(
    tripId,
    memberId,
    currentUser,
    includeStat = false,
    includePermissions = false
  ) {
    try {
      let trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      trip = JSON.parse(JSON.stringify(trip));
      trip['ownerDetails'] = await UserModel.getById(trip.ownerId);
      if (memberId) {
        if (includeStat) {
          trip['awaitingCount'] = await BookingModel.count({
            tripId: tripId,
            status: 'invited',
          });
        }
        const user = await UserModel.get({ awsUserId: memberId });
        if (user) {
          const memberParams = {
            tripId: tripId,
            memberId: user._id,
            isFavorite: true,
          };
          const member = await MemberModel.get(memberParams);
          trip['isFavorite'] = member && member.isFavorite ? true : false;
          const booking = await BookingModel.get({
            memberId: user._id.toString(),
            tripId: tripId,
            status: { $in: ['pending', 'approved'] },
          });
          if (booking) {
            trip['bookingId'] = booking._id;
            trip['bookingDetails'] = booking;
          }
        }
      }
      if (includePermissions) {
        trip[
          'permissions'
        ] = await PermissionsController.generateInheritedPermissionsByUser(
          tripId,
          currentUser
        );
        // trip['permissions'] = await UserPermissionModel.findOne({
        //   tripId: trip._id,
        //   email: currentUser.email,
        // });
      }
      return trip;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteTrip(tripId, user) {
    try {
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      const members = await MemberModel.list({
        filter: { tripId: tripId },
      });
      const bookings = await BookingModel.list({
        filter: {
          tripId: tripId,
          status: { $in: ['pending', 'approved'] },
        },
      });

      if (checkPermission(user, trip, 'trip', 'edit')) {
        if (
          trip.status == 'draft' ||
          members.length <= 1 ||
          bookings.length == 0
        ) {
          await TripModel.update(tripId, {
            isArchived: true,
            status: 'deleted',
          });
          await logActivity({
            ...LogMessages.DELETE_TRIP_HOST(trip['title']),
            tripId: trip._id.toString(),
            audienceIds: [user._id.toString()],
            userId: user._id.toString(),
          });
          // try {
          //   await EmailSender(user, EmailMessages.DRAFT_TRIP_DELETED, [
          //     trip['title'],
          //   ]);
          //   console.log('Email sent');
          // } catch (err) {
          //   console.log(err);
          // }
        } else {
          throw ERROR_KEYS.CANNOT_DELETE_TRIP;
        }
      } else if (user.isAdmin) {
        await TripModel.update(tripId, {
          isArchived: true,
          status: 'deleted',
        });
        await logActivity({
          ...LogMessages.DELETE_TRIP_HOST(trip['title']),
          tripId: trip._id.toString(),
          audienceIds: [trip.owner_id],
          userId: user._id.toString(),
        });
      } else {
        throw ERROR_KEYS.UNAUTHORIZED;
      }
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async myActiveTrips(filter, user) {
    try {
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

      // Filter trips
      const trips = await getTripsByPermissions(user);
      const currentDate = parseInt(moment().format('YYYYMMDD'));
      const tripParams = {
        isActive: true,
        $or: [{ ownerId: user._id }, { _id: { $in: trips } }],
      };

      if (filter.isPublic) tripParams['isPublic'] = filter.isPublic;
      if (filter.status) tripParams['status'] = filter.status;
      if (filter.status !== 'draft') tripParams['status'] = { $nin: ['draft'] };
      if (filter.includeDraft) {
        delete tripParams['status'];
      }

      tripParams['$and'] = [
        { endDate: { $gte: currentDate } },
        { status: { $nin: ['completed', 'cancelled'] } },
        { isArchived: false },
      ];
      const params = [];
      params.push({
        $match: tripParams,
      });

      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'startDate', 'spotsFilled'],
          'updatedAt'
        ),
      });

      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $skip: limit * page });
      params.push({ $limit: limit });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'ownerId',
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
      params.push({
        $project: {
          trip: 0,
          memberId: 0,
          tripId: 0,
        },
      });
      const resTrips = await TripModel.aggregate(params);
      return {
        data: resTrips,
        count: resTrips.length,
      };
    } catch (error) {
      throw error;
    }
  }

  static async activeTrips(filter, user) {
    try {
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

      // Filter trips
      const trips = await getTripsByPermissions(user);
      const tripParams = {
        isActive: true,
        isArchived: false,
        $or: [{ ownerId: user._id }, { _id: { $in: trips } }],
      };
      const params = [];
      params.push({
        $match: tripParams,
      });

      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'startDate', 'spotsFilled'],
          'updatedAt'
        ),
      });

      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $skip: limit * page });
      params.push({ $limit: limit });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'ownerId',
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
      params.push({
        $project: {
          trip: 0,
          memberId: 0,
          tripId: 0,
        },
      });
      const resTrips = await TripModel.aggregate(params);
      return {
        data: resTrips,
        count: resTrips.length,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async myTrips(filter, user) {
    try {
      const filterParams = {
        isMember: true,
      };
      if (filter.memberId) {
        if (!Types.ObjectId.isValid(filter.memberId)) {
          throw 'Invalid memberID';
        }
        filterParams['memberId'] = Types.ObjectId(filter.memberId);
      } else {
        filterParams['memberId'] = user._id;
      }
      // Active trips and draft trips
      if (
        (filter.isHost || filter.status == 'draft') &&
        filterParams['memberId'] == user._id
      )
        filterParams['isOwner'] = true;
      // Favorite trips
      else if (filter.isFavorite) {
        delete filterParams['isMember'];
        filterParams['isFavorite'] = true;
      }

      const params = [
        {
          $match: filterParams,
        },
      ];

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
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', '$trip'] },
        },
      });

      // Filter trips
      const currentDate = parseInt(moment().format('YYYYMMDD'));
      const tripParams = {
        isActive: true,
      };
      if (filter.isPublic) tripParams['isPublic'] = filter.isPublic;
      if (filter.status) tripParams['status'] = filter.status;
      if (filter.status !== 'draft') tripParams['status'] = { $nin: ['draft'] };
      if (filter.includeDraft) {
        delete tripParams['status'];
      }
      if (filter.pastTrips || filter.isArchived) {
        tripParams['$or'] = [
          { endDate: { $lt: currentDate } },
          { status: { $in: ['completed', 'cancelled'] } },
          { isArchived: true },
        ];
      } else {
        tripParams['$and'] = [
          { endDate: { $gte: currentDate } },
          { status: { $nin: ['completed', 'cancelled'] } },
          { isArchived: false },
        ];
      }

      params.push({
        $match: tripParams,
      });

      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'startDate', 'spotsFilled'],
          'updatedAt'
        ),
      });

      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $skip: limit * page });
      params.push({ $limit: limit });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'ownerDetails',
          pipeline: [
            {
              $project: USER_BASIC_INFO,
            },
          ],
        },
      });
      params.push({
        $unwind: {
          path: '$ownerDetails',
          preserveNullAndEmptyArrays: true,
        },
      });
      params.push({
        $project: {
          trip: 0,
          memberId: 0,
          tripId: 0,
        },
      });
      const resTrips = await MemberModel.aggregate(params);
      return {
        data: resTrips,
        count: resTrips.length,
      };
    } catch (error) {
      throw error;
    }
  }

  static async listMembers(filter) {
    try {
      const filterParams = {
        tripId: Types.ObjectId(filter.tripId),
        isMember: true,
      };
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
          isOwner: 1,
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
  static async tripBookings(tripId, awsUserId) {
    try {
      const trip = await TripModel.getById(tripId).select({
        rooms: 1,
        addOns: 1,
        guestCount: 1,
        externalCount: 1,
        hostCount: 1,
        spotsFilled: 1,
        spotsReserved: 1,
        spotsAvailable: 1,
        groupSize: 1,
        maxGroupSize: 1,
        tripPaymentType: 1,
        paymentViewName: 1,
        paymentCustomColumns: 1,
        paymentViews: 1,
        travelerViewName: 1,
        travelerCustomColumns: 1,
        travelerViews: 1,
        questionsView: 1,
        attendeeView: 1,
        isRSVPEnabled: 1,
        isBookingEnabled: 1,
      });
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      // const user = await UserModel.get({ awsUserId: awsUserId });
      // if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

      const params = [
        {
          $match: {
            tripId: tripId,
            status: 'approved',
          },
        },
        {
          $project: {
            memberId: {
              $toObjectId: '$memberId',
            },
            guests: 1,
            addOns: 1,
            rooms: 1,
            attendees: 1,
            company: 1,
            team: 1,
            property: 1,
            coupon: 1,
            discount: 1,
            currentDue: 1,
            paidAmout: 1,
            pendingAmount: 1,
            paymentHistory: 1,
            customFields: 1,
            updatedAt: 1,
            questions: 1,
            isRSVPEnabled: 1,
            isBookingEnabled: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'memberId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'bookingresources',
            localField: '_id',
            foreignField: 'bookingId',
            as: 'resources',
          },
        },
      ];
      const bookings = await BookingModel.aggregate(params);
      const rooms = {};
      const addOns = {};
      trip.rooms?.map(room => {
        room.variants?.forEach(variant => {
          rooms[`${room.id}_${variant.id}`] = {
            ...variant,
            roomName: room.name,
            roomId: room.id,
          };
        });

        return room;
      });
      trip.addOns?.forEach(addOn => {
        addOns[addOn.id] = addOn;
      });
      return bookings.map(booking => {
        const { email, firstName, lastName, username, livesIn, avatarUrl } =
          booking.user || {};

        const addOnsInfo = JSON.parse(JSON.stringify(addOns));
        if (booking.rooms?.length > 0) {
          const roomInfo = JSON.parse(JSON.stringify(rooms));
          booking.rooms =
            booking.rooms?.map(room => {
              if (roomInfo[`${room.room.id}_${room.variant.id}`])
                room = {
                  ...roomInfo[`${room.room.id}_${room.variant.id}`],
                  attendees: room.attendees,
                };
              return room;
            }) || [];
        }
        if (booking.addOns?.length > 0) {
          booking.addOns =
            booking.addOns?.map(addOn => {
              if (addOnsInfo[addOn.id]) {
                addOn = {
                  ...addOnsInfo[addOn.id],
                  attendees: addOn.attendees,
                };
              }
              return addOn;
            }) || [];
        }
        const bookingInfo = {
          attendeeName: `${firstName} ${lastName || ''}`,
          username: username,
          email: email,
          avatarUrl: avatarUrl,
          location: livesIn,
          ...booking,
        };
        return bookingInfo;
      });
    } catch (error) {
      throw error;
    }
  }
  static async deleteCoHost(tripId, hostId, user) {
    try {
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      if (!(trip?.ownerId == user._id.toString() || user.isAdmin))
        throw ERROR_KEYS.UNAUTHORIZED;
      const hosts = trip.coHosts.filter(host => host.id !== hostId);
      await TripModel.update(trip._id, { coHosts: hosts });
      return 'success';
    } catch (err) {
      throw err;
    }
  }
  static async transferHost(tripId, params, user) {
    try {
      const userFound = await UserModel.getById(params.hostId);
      if (!userFound) throw ERROR_KEYS.USER_NOT_FOUND;
      if (!userFound.isHost) throw ERROR_KEYS.UNAUTHORIZED;
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      if (!(trip?.ownerId == user._id.toString() || user.isAdmin))
        throw ERROR_KEYS.UNAUTHORIZED;
      await TripModel.update(trip._id, { ownerId: userFound._id });
      await MemberModel.update(
        { tripId: trip._id, isOwner: true },
        { memberId: userFound._id }
      );
      return 'success';
    } catch (err) {
      throw err;
    }
  }
  static async addCoHost(tripId, params, user) {
    try {
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      if (!(trip?.ownerId == user._id.toString() || user.isAdmin))
        throw ERROR_KEYS.UNAUTHORIZED;
      const userFound = await UserModel.get({
        $or: [{ email: params?.email }, { username: params?.email }],
      });
      if (!userFound) throw ERROR_KEYS.USER_NOT_FOUND;
      const ids = trip?.coHosts?.map(host => host.id);
      if (!ids.includes(userFound._id.toString()))
        if (trip.coHosts && Array.isArray(trip.coHosts))
          trip.coHosts.push({
            id: userFound._id.toString(),
            addedBy: user._id.toString(),
            addedAt: moment().unix(),
          });
        else
          trip.coHosts = [
            {
              id: userFound._id.toString(),
              addedBy: user._id.toString(),
              addedAt: moment().unix(),
            },
          ];
      await TripModel.update(trip._id, { coHosts: trip.coHosts });
      return trip;
    } catch (err) {
      throw err;
    }
  }
  static async getCoHosts(tripId, user) {
    try {
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      if (!checkPermission(user, trip, 'permissions', 'view'))
        throw ERROR_KEYS.UNAUTHORIZED;

      const ids = trip?.coHosts?.map(host => Types.ObjectId(host.id));
      return await UserModel.list({
        filter: {
          _id: { $in: ids },
        },
        select: {
          username: 1,
          email: 1,
          awsUserId: 1,
          firstName: 1,
          lastName: 1,
          avatarUrl: 1,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  static async getInviteList(user) {
    const currentDate = parseInt(moment().format('YYYYMMDD'));
    try {
      const query = [
        {
          $match: {
            memberId: user._id.toString(),
            status: {
              $in: ['invited', 'invite-accepted', 'invite-declined'],
            },
          },
        },
        {
          $project: {
            ...bookingProjection,
            tripId: {
              $toObjectId: '$tripId',
            },
          },
        },
        {
          $lookup: {
            from: 'trips',
            localField: 'tripId',
            foreignField: '_id',
            as: 'trip',
          },
        },
        {
          $unwind: {
            path: '$trip',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: { 'trip.endDate': { $gte: currentDate } },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'trip.ownerId',
            foreignField: '_id',
            as: 'ownerDetails',
          },
        },
        {
          $unwind: {
            path: '$ownerDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      return await BookingModel.aggregate(query);
    } catch (err) {
      throw err;
    }
  }

  static async listAdminTrips(filter) {
    try {
      const filterParams = {};
      if (filter.status) {
        filterParams['status'] = filter.status;
      }
      const params = [{ $match: filterParams }];
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      filter['sortOrder'] = -1;
      params.push({
        $sort: prepareSortFilter(filter, ['endDate'], 'endDate'),
      });
      params.push({ $skip: limit * page });
      params.push({ $limit: limit });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'ownerId',
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

      let resTrips = await TripModel.aggregate(params);
      const resCount = await TripModel.count(filterParams);

      return {
        data: resTrips,
        totalCount: resCount,
        count: resTrips.length,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
