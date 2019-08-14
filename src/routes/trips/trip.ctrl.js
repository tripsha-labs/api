import _ from 'lodash';
import moment from 'moment';
import uuid from 'uuid';
import { TripModel, MemberModel, UserModel } from '../../models';
import { TABLE_NAMES } from '../../constants';
import { ERROR_KEYS } from '../../constants';
import { base64Encode, base64Decode } from '../../helpers';
export class TripController {
  static async listTrips(tripFilter, memberId) {
    try {
      // Get search string from queryparams
      const filterExpressions = [];
      const filterAttributeValues = [
        {
          ':isArchived': 0,
        },
      ];
      const filter = {
        KeyConditionExpression: 'isArchived=:isArchived',
        IndexName: 'newestTrips',
        ScanIndexForward: false,
      };
      if (tripFilter) {
        filter['ScanIndexForward'] = tripFilter.sortOrder
          ? tripFilter.sortOrder
          : false;
        // Sort by earliest departure
        if (tripFilter.sortBy == 'earliestDeparture') {
          filter['IndexName'] = 'StartDateIndex';
          filter['ScanIndexForward'] =
            tripFilter.sortOrder == false ? false : true;
        }
        // Sort by most spots filled
        if (tripFilter.sortBy == 'mostSpotsFilled') {
          filter['IndexName'] = 'SpotsFilledIndex';
          filter['ScanIndexForward'] = tripFilter.sortOrder
            ? tripFilter.sortOrder
            : false;
        }

        // Budgets
        if (tripFilter.budgets) {
          const budgets = tripFilter.budgets.split(',');
          const budgetFilter = [];
          _.forEach(budgets, (value, key) => {
            filterAttributeValues.push({
              [':budgets' + key]: value,
            });
            budgetFilter.push('contains(budgets, :budgets' + key + ')');
          });
          budgetFilter.length > 0 &&
            filterExpressions.push('(' + budgetFilter.join(' or ') + ')');
        }
        // minGroupSize
        if (tripFilter.minGroupSize) {
          filterAttributeValues.push({
            ':minGroupSize': parseInt(tripFilter.minGroupSize),
          });
          filterExpressions.push('minGroupSize >= :minGroupSize');
        }
        // maxGroupSize
        if (tripFilter.maxGroupSize) {
          filterAttributeValues.push({
            ':maxGroupSize': parseInt(tripFilter.maxGroupSize),
          });
          filterExpressions.push('maxGroupSize <= :maxGroupSize');
        }
        // minStartDate
        if (tripFilter.minStartDate) {
          filterAttributeValues.push({
            ':minStartDate': parseInt(tripFilter.minStartDate),
          });
          filterExpressions.push('startDate >= :minStartDate');
        }
        // endDate
        if (tripFilter.maxEndDate) {
          filterAttributeValues.push({
            ':maxEndDate': parseInt(tripFilter.maxEndDate),
          });
          filterExpressions.push('startDate <= :maxEndDate');
        }
        // minTripLength
        if (tripFilter.minTripLength) {
          filterAttributeValues.push({
            ':minTripLength': parseInt(tripFilter.minTripLength),
          });
          filterExpressions.push('tripLength >= :minTripLength');
        }
        // maxTripLength
        if (tripFilter.maxTripLength) {
          filterAttributeValues.push({
            ':maxTripLength': parseInt(tripFilter.maxTripLength),
          });
          filterExpressions.push('tripLength <= :maxTripLength');
        }
        // interests
        if (tripFilter.interests) {
          const interests = tripFilter.interests.split(',');
          const interestFilter = [];
          _.forEach(interests, (value, key) => {
            filterAttributeValues.push({
              [':interests' + key]: value,
            });
            interestFilter.push('contains(interests, :interests' + key + ')');
          });
          interestFilter.length > 0 &&
            filterExpressions.push('(' + interestFilter.join(' or ') + ')');
        }
        // destinations
        if (tripFilter.destinations) {
          const destinations = tripFilter.destinations.split(',');
          const destinationsFilter = [];
          _.forEach(destinations, (value, key) => {
            filterAttributeValues.push({
              [':destinations' + key]: value,
            });
            destinationsFilter.push(
              'contains(destinations, :destinations' + key + ')'
            );
          });
          destinationsFilter.length > 0 &&
            filterExpressions.push('(' + destinationsFilter.join(' or ') + ')');
        }
      }
      let filterAttributes = {};
      _.forEach(
        filterAttributeValues,
        value => (filterAttributes = { ...filterAttributes, ...value })
      );
      if (filterExpressions.length > 0)
        filter['FilterExpression'] = filterExpressions.join(' and ');
      filter['ExpressionAttributeValues'] = filterAttributes;

      const params = {
        ...filter,
        ...base64Decode(tripFilter.nextPageToken),
      };

      const resTrips = await new TripModel().list(params);

      const tripList = await TripController.injectData(
        resTrips.Items,
        memberId
      );
      const result = {
        data: tripList,
        count: resTrips.Count,
        ...base64Encode(resTrips.LastEvaluatedKey),
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
      data['groupSize'] = 1;
      data['spotFilledRank'] = Math.round(
        (data['groupSize'] / data['maxGroupSize']) * 100
      );
      data['isFull'] = data['spotFilledRank'] == 100;
      const params = {
        ...data, // validated data
        isActive: true,
        isArchived: 0,
        id: uuid.v1(),
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
      };

      await new TripModel().add(params);
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
      tripKeys.push({ id: item.tripId });
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
