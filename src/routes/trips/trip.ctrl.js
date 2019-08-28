import moment from 'moment';
import _ from 'lodash';
import { dbConnect, dbClose } from '../../utils/db-connect';
import { prepareSortFilter } from '../../helpers';
import {
  TripModel,
  MemberModel,
  validateTripLength,
  UserModel,
} from '../../models';
import { ERROR_KEYS, APP_CONSTANTS } from '../../constants';
export class TripController {
  static async listTrips(filter, memberId) {
    try {
      const currentDate = parseInt(moment().format('YYYYMMDD'));
      const filterParams = {
        isArchived: false,
        startDate: { $gte: currentDate },
        isFull: false, // TBD: do we need to show or not, currently full trips not visible
      };

      if (filter.minGroupSize)
        filterParams['minGroupSize'] = { $gte: filter.minGroupSize };

      if (filter.maxGroupSize)
        filterParams['maxGroupSize'] = { $lte: filter.maxGroupSize };

      if (filter.minStartDate)
        filterParams['startDate'] = { $gte: filter.minStartDate };

      if (filter.maxEndDate)
        filterParams['startDate'] = { $lte: filter.maxEndDate };

      if (filter.minTripLength)
        filterParams['tripLength'] = { $gte: filter.minTripLength };

      if (filter.maxTripLength)
        filterParams['tripLength'] = { $lte: filter.maxTripLength };

      const multiFilter = [];
      if (filter.interests && filter.interests.length > 0) {
        multiFilter.push({ interests: { $in: filter.interests } });
      }

      if (filter.destinations && filter.destinations.length > 0) {
        multiFilter.push({ interests: { $in: filter.destinations } });
      }
      if (multiFilter.length > 0) filterParams['$and'] = multiFilter;

      const params = [{ $match: filterParams }];

      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'startDate', 'spotsFilled'],
          'updatedAt'
        ),
      });
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $limit: limit });
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });
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

      await dbConnect();

      let resTrips = await TripModel.aggregate(params);
      if (memberId) {
        const tripIds = resTrips.map(trip => trip._id);
        const user = await UserModel.get({ awsUserId: memberId });
        const memberParams = {
          tripId: { $in: tripIds },
          memberId: user._id,
          isFavorite: true,
        };
        const members = await MemberModel.list(memberParams);
        const favoriteTripIds = members.map(member => member.tripId);
        resTrips = resTrips.map(trip => {
          trip['isFavorite'] = _.indexOf(favoriteTripIds, trip._id) !== -1;
          return trip;
        });
      }

      const resCount = await TripModel.count(filterParams);

      return {
        data: resTrips,
        count: resCount,
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

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

      params['tripLength'] = tripLength;

      await dbConnect();
      params['ownerId'] = await UserModel.get({ awsUserId: params.ownerId });
      const trip = await TripModel.create(params);
      const addMemberParams = {
        memberId: trip.ownerId,
        tripId: trip._id,
        isOwner: true,
        isMember: true,
      };
      await MemberModel.create(addMemberParams);
      const memberCount = await MemberModel.count({
        tripId: trip._id,
        isMember: true,
      });
      const spotsFilled = Math.round(
        (memberCount / params['maxGroupSize']) *
          APP_CONSTANTS.SPOTSFILLED_PERCEENT
      );
      const tripDetails = {
        groupSize: memberCount,
        spotsFilled: spotsFilled,
        isFull: spotsFilled === APP_CONSTANTS.SPOTSFILLED_PERCEENT,
      };
      await TripModel.update(trip._id, tripDetails);
      return trip;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async updateTrip(tripId, trip) {
    try {
      await dbConnect();
      const tripDetails = await TripModel.getById(tripId);
      if (!tripDetails) throw ERROR_KEYS.TRIP_NOT_FOUND;
      if (
        trip['startDate'] &&
        trip['startDate'] != '' &&
        (trip['endDate'] && trip['endDate'] != '')
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
        trip['tripLength'] = tripLength;
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
        trip['tripLength'] = tripLength;
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
        trip['tripLength'] = tripLength;
      }

      const memberCount = await MemberModel.count({
        tripId: tripId,
        isMember: true,
      });

      const maxGroupSize = trip['maxGroupSize']
        ? trip['maxGroupSize']
        : tripDetails['maxGroupSize'];
      trip['groupSize'] = memberCount;
      trip['spotsFilled'] = Math.round(
        (memberCount / maxGroupSize) * APP_CONSTANTS.SPOTSFILLED_PERCEENT
      );
      trip['isFull'] =
        trip['spotsFilled'] === APP_CONSTANTS.SPOTSFILLED_PERCEENT;

      await TripModel.update(tripId, trip);
      return 'success';
    } catch (error) {
      throw error;
    } finally {
      dbClose();
    }
  }

  static async getTrip(tripId, memberId) {
    try {
      await dbConnect();
      let trip = await TripModel.get({ _id: tripId });
      if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
      trip = JSON.parse(JSON.stringify(trip));
      trip['ownerDetails'] = await UserModel.getById(trip.ownerId);
      if (memberId) {
        const user = await UserModel.get({ awsUserId: memberId });
        if (user) {
          const memberParams = {
            tripId: tripId,
            memberId: user._id,
            isFavorite: true,
          };
          const member = await MemberModel.get(memberParams);

          trip['isFavorite'] = member && member.isFavorite ? true : false;
        }
      }
      return trip;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async deleteTrip(tripId) {
    try {
      await dbConnect();
      await TripModel.delete(tripId);
      //TODO: Delete members and other dependecies with the trip
      return 'success';
    } catch (error) {
      throw error;
    } finally {
      dbClose();
    }
  }

  static async myTrips(filter) {
    try {
      await dbConnect();
      const user = await UserModel.get({ awsUserId: filter.memberId });
      const filterParams = {
        memberId: user._id,
        isActive: true,
      };
      if (filter.isMember) filterParams['isMember'] = true;
      else if (filter.isFavorite) filterParams['isFavorite'] = true;
      const params = [
        {
          $match: filterParams,
        },
      ];

      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'startDate', 'spotsFilled'],
          'updatedAt'
        ),
      });
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $limit: limit });
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });
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
          newRoot: { $mergeObjects: ['$trip', '$$ROOT'] },
        },
      });
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

      const resTrips = await MemberModel.aggregate(params);
      const resCount = await MemberModel.count(filterParams);

      return {
        data: resTrips,
        count: resCount,
      };
    } catch (error) {
      throw error;
    } finally {
      dbClose();
    }
  }
}
