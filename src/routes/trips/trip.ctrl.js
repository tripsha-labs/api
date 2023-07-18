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
  TopicModel,
  LinkModel,
  BookingModel,
  AssetModel,
  AssetLinkModel,
  UserPermissionModel,
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
  static async listTrips(filter, currenUser) {
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
  static async createProject(createPayload, data) {
    try {
      const resTrip = await TripModel.create(createPayload);
      const payload = {};
      if (data.hasOwnProperty('tripId')) {
        const trip = await TripModel.getById(data.tripId);
        if (!trip) throw 'Unable to find trip';
        if (data.hasOwnProperty('content')) {
          data.content?.forEach(async content => {
            switch (content) {
              case 'trip_page':
                // trip part
                payload['pictureUrls'] = trip.pictureUrls;
                payload['title'] = trip.title;
                if (trip.location) payload['location'] = trip.location;
                if (trip.maxGroupSize)
                  payload['maxGroupSize'] = trip.maxGroupSize;
                if (trip.description) payload['description'] = trip.description;
                break;
              case 'topics':
                // insert topics
                const topics = await TopicModel.find({
                  tripId: Types.ObjectId(data.tripId),
                }).lean();

                const topicsPayload = topics?.map(topic => {
                  topic['tripId'] = resTrip._id;
                  delete topic['_id'];
                  return topic;
                });
                await TopicModel.insertMany(topicsPayload);
                if (trip.topics) payload['topics'] = trip.topics;
                break;
              case 'attendee_views':
                if (trip?.travelerViews) {
                  payload['travelerViews'] = trip.travelerViews;
                  payload['travelerViewName'] = trip?.travelerViewName;
                }
                break;
              // case 'resources':
              //   // insert resource
              //   payload['resources'] = trip.resources;
              //   break;
              case 'questions':
                // trip part
                if (trip.questions) payload['questions'] = trip.questions;
                if (trip?.questionsView)
                  payload['questionsView'] = trip.questionsView;
                break;
              case 'budget':
                // trip part
                if (trip.budget) payload['budget'] = trip.budget;
                break;
              case 'links':
                // insert links
                const links = await LinkModel.find({
                  tripId: Types.ObjectId(data.tripId),
                }).lean();

                const linksPayload = links?.map(link => {
                  link['tripId'] = resTrip._id;
                  delete link['_id'];
                  return link;
                });
                await LinkModel.insertMany(linksPayload);
                if (trip.linksView) payload['linksView'] = trip.linksView;
                break;
            }
          });
          if (Object.keys(payload)?.length > 0) {
            await TripModel.update(resTrip._id, payload);
          }
          if (!data.content?.includes('topics')) {
            await TopicController.addDefaultTopics(
              resTrip._id,
              payload.ownerId
            );
          }
        }
      } else {
        await TopicController.addDefaultTopics(resTrip._id, payload.ownerId);
      }
      return resTrip;
    } catch (err) {}
  }
  static async editProject(id, payload) {
    try {
      const resTrip = await TripModel.update(Types.ObjectId(id), payload);
      return resTrip;
    } catch (err) {}
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
      if (!(await checkPermission(user, tripDetails, module, 'edit'))) {
        throw ERROR_KEYS.UNAUTHORIZED;
      }
      const exustingMemberCount = await MemberModel.count({
        tripId: Types.ObjectId(tripId),
      });
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
        tripId: Types.ObjectId(tripId),
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
      payload['status'] = 'published';
      payload['lastSavedDate'] = payload['lastPublishedDate'];
      payload['updatedBy'] = user._id;
      await TripModel.update(Types.ObjectId(tripId), payload);
    } catch (err) {
      throw err;
    }
  }
  static async unPublishTrip(tripId, user) {
    try {
      if (!user) throw ERROR_KEYS.UNAUTHORIZED;
      const payload = {};
      payload['lastPublishedDate'] = null;
      payload['status'] = 'draft';
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
      if (!trip || !trip?.isActive) throw ERROR_KEYS.TRIP_NOT_FOUND;
      trip = JSON.parse(JSON.stringify(trip));
      trip['ownerDetails'] = await UserModel.getById(trip.ownerId);
      if (memberId) {
        if (includeStat) {
          trip['awaitingCount'] = await BookingModel.count({
            tripId: Types.ObjectId(tripId),
            status: 'invited',
          });
        }
        const user = await UserModel.get({ awsUserId: memberId });
        if (user) {
          const memberParams = {
            tripId: Types.ObjectId(tripId),
            memberId: user._id,
            isFavorite: true,
          };
          const member = await MemberModel.get(memberParams);
          trip['isFavorite'] = member && member.isFavorite ? true : false;
          const booking = await BookingModel.get({
            memberId: user._id,
            tripId: Types.ObjectId(tripId),
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
      if (await checkPermission(user, trip, 'trip', 'edit')) {
        await TripModel.update(tripId, {
          isActive: false,
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
        throw ERROR_KEYS.UNAUTHORIZED;
      }
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async cancelTrip(tripId, user) {
    try {
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;

      if (await checkPermission(user, trip, 'trip', 'edit')) {
        await TripModel.update(tripId, {
          isArchived: true,
          status: 'canceled',
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
        throw ERROR_KEYS.UNAUTHORIZED;
      }
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async restoreTrip(tripId, user) {
    try {
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;

      if (await checkPermission(user, trip, 'trip', 'edit')) {
        await TripModel.update(tripId, {
          isArchived: false,
          status: 'draft',
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
        { status: { $nin: ['completed', 'canceled'] } },
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
  // Travelers trips
  static async myTrips(filter, user) {
    try {
      const filterParams = { isActive: true };
      if (filter.memberId) {
        if (!Types.ObjectId.isValid(filter.memberId)) {
          throw 'Invalid memberID';
        }
        filterParams['memberId'] = Types.ObjectId(filter.memberId);
      } else {
        filterParams['memberId'] = user._id;
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
          preserveNullAndEmptyArrays: false,
        },
      });
      params.push({
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', '$trip'] },
        },
      });
      const tripParams = { isActive: true };
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
      params.push({
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking',
          pipeline: [
            {
              $project: {
                status: 1,
              },
            },
          ],
        },
      });
      params.push({
        $unwind: {
          path: '$booking',
          preserveNullAndEmptyArrays: true,
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
          bookingId: 1,
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

      const params = [
        {
          $match: {
            tripId: Types.ObjectId(tripId),
            status: 'approved',
          },
        },
        {
          $project: {
            memberId: 1,
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

  static async transferHost(tripId, params, user) {
    try {
      const userFound = await UserModel.getById(params.hostId);
      if (!userFound) throw ERROR_KEYS.USER_NOT_FOUND;
      const trip = await TripModel.getById(tripId);
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      if (!(trip?.ownerId == user._id.toString() || user.isAdmin))
        throw ERROR_KEYS.UNAUTHORIZED;
      await TripModel.update(trip._id, { ownerId: userFound._id });
      await UserPermissionModel.updateOne({
        email: user.email,
        tripId: trip._id,
      }, {
        $set: {
          email: user.email, coHost: true,
          directPermissions: { tabPermissions: {}, viewPermissions: {}, topicPermissions: {} }
        }
      }, { upsert: true });
      
      await UserPermissionModel.deleteMany({
        email: userFound.email,
        tripId: trip._id,
      });
      return 'success';
    } catch (err) {
      throw err;
    }
  }

  static async listAdminTrips(filter) {
    try {
      const filterParams = { isActive: true };
      if (filter.status) {
        if (['published', 'unpublished'].includes(filter.status))
          filterParams['isPublished'] = filter.status == 'published';
        else filterParams['status'] = filter.status;
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
