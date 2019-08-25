import { dbConnect } from '../../utils/db-connect';
import { prepareCommonFilter } from '../../helpers';

import _ from 'lodash';
import moment from 'moment';
import uuid from 'uuid';
import {
  TripModel,
  MemberModel,
  UserModel,
  validateTripLength,
} from '../../models';
import { TABLE_NAMES } from '../../constants';
import { ERROR_KEYS } from '../../constants';
import { base64Encode, base64Decode } from '../../helpers';
export class TripController {
  static async listTrips(filter) {
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
      filterParams['$and'] = multiFilter;

      const params = {
        filter: filterParams,
        ...prepareCommonFilter(filter, ['email']),
      };

      const resTrips = await TripModel.list(params);
      const resCount = await TripModel.count(filterParams);

      const result = {
        data: resTrips,
        count: resCount,
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async createTrip(data) {
    try {
      data['startDate'] = parseInt(data['startDate']);
      data['endDate'] = parseInt(data['endDate']);
      const params = {
        ...data,
        isActive: true,
        isArchived: 0,
      };

      await TripModel.add(params);
      const addMemberParams = {
        memberId: data['ownerId'],
        tripId: params.id,
        isActive: true,
        isOwner: true,
        isMember: true,
        isFavorite: false,
        updatedAt: moment().unix(),
      };
      await new MemberModel().add(addMemberParams);
      return params;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateTrip(tripId, data) {
    try {
      const trip = { ...data, updatedAt: moment().unix() };
      const tripModel = new TripModel();
      if (trip['maxGroupSize']) {
        const tripDetails = await tripModel.get(tripId);

        if (!(tripDetails && tripDetails.Item)) throw 'Trip not found';
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

          if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength))
            throw ERROR_KEYS.INVALID_DATES;
          trip['tripLength'] = tripLength;
        } else if (trip['startDate'] && trip['startDate'] != '') {
          trip['startDate'] = parseInt(trip['startDate']);
          const tripLength = validateTripLength(
            trip['startDate'],
            tripDetails.Item['endDate']
          );

          if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength))
            throw ERROR_KEYS.INVALID_DATES;
          trip['tripLength'] = tripLength;
        } else if (trip['endDate'] && trip['endDate'] != '') {
          trip['endDate'] = parseInt(trip['endDate']);
          const tripLength = validateTripLength(
            tripDetails.Item['startDate'],
            trip['endDate']
          );

          if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength))
            throw ERROR_KEYS.INVALID_DATES;
          trip['tripLength'] = tripLength;
        }
        trip['spotFilledRank'] = Math.round(
          (tripDetails.Item['groupSize'] / trip['maxGroupSize']) * 100
        );
        trip['isFull'] = trip['spotFilledRank'] == 100;
      }
      await tripModel.update(tripId, trip);
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async getTrip(tripId, memberId) {
    try {
      const trip = await new TripModel().get(tripId);
      if (!(trip && trip.Item)) throw ERROR_KEYS.TRIP_NOT_FOUND;
      trip.Item['tripId'] = trip.Item.id;
      const tripList = await TripController.injectData([trip.Item], memberId);
      return tripList.shift();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteTrip(tripId) {
    try {
      await new TripModel().delete(tripId);
      //TODO: Delete members and other dependecies with the trip
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async myTrips(memberId) {
    try {
      const resMembers = await new MemberModel().myTrips(memberId);
      if (resMembers && resMembers.Items && resMembers.Items.length <= 0)
        return {
          data: [],
          count: 0,
        };
      const trips = await TripController.injectData(resMembers.Items, memberId);
      const result = {
        data: trips,
        count: trips.length,
      };

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async savedTrips(memberId) {
    try {
      const resMembers = await new MemberModel().savedTrips(memberId);
      if (resMembers && resMembers.Items && resMembers.Items.length <= 0)
        return {
          data: [],
          count: 0,
        };
      const trips = await TripController.injectData(resMembers.Items, memberId);
      const result = {
        data: trips,
        count: trips.length,
      };
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async injectData(trips, memberId) {
    const tripModel = new TripModel();
    const tripKeys = [];
    _.forEach(trips, item => {
      tripKeys.push({ id: item.tripId ? item.tripId : item.id });
    });

    try {
      if (tripKeys.length <= 0) throw 'Invalid keys';
      const resTrips = await tripModel.batchList(tripKeys);
      if (resTrips.Responses) {
        trips = await TripController.injectUserDetails(
          resTrips.Responses[TABLE_NAMES.TRIP]
        );
        trips = await TripController.injectFavoriteDetails(trips, memberId);
      }
    } catch (error) {
      console.log(error);
    }

    return trips;
  }

  static async injectUserDetails(trips) {
    const promises = [];
    const userModel = new UserModel();
    trips.forEach(trip => {
      promises.push(
        new Promise(async res => {
          try {
            const result = await userModel.get(trip.ownerId);
            trip.createdBy = result.Item;
          } catch (error) {
            console.log(error);
          }
          return res(trip);
        })
      );
    });
    return Promise.all(promises);
  }

  static async injectFavoriteDetails(trips, memberId) {
    const promises = [];
    const memberModel = new MemberModel();
    trips.map(trip => {
      promises.push(
        new Promise(async res => {
          if (!memberId) {
            trip.isFavorite = false;
            return res(trip);
          }
          try {
            const result = await memberModel.get({
              tripId: trip.id,
              memberId: memberId,
            });

            trip.isFavorite =
              result && result.Item && result.Item.isFavorite ? true : false;
          } catch (error) {
            trip.isFavorite = false;
            console.log(error);
          }
          return res(trip);
        })
      );
    });
    return Promise.all(promises);
  }
}
