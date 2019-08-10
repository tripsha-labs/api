import _ from 'lodash';
import * as moment from 'moment';
import uuid from 'uuid';
import { TripModel, MemberModel, UserModel } from '../../models';

export class TripController {
  static async listTrips(tripFilter) {
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
    // Build nextpage token
    const exclusiveStartKey =
      tripFilter && tripFilter.nextPageToken
        ? {
            ExclusiveStartKey: JSON.parse(
              Buffer.from(tripFilter.nextPageToken, 'base64').toString('ascii')
            ),
          }
        : {};
    const params = {
      ...filter,
      ...exclusiveStartKey,
    };
    try {
      const tripModel = new TripModel();
      const resTrips = await tripModel.list(params);
      const lastEvaluatedKey =
        resTrips && resTrips.LastEvaluatedKey
          ? {
              nextPageToken: Buffer.from(
                JSON.stringify(resTrips.LastEvaluatedKey)
              ).toString('base64'),
            }
          : {};
      const result = {
        data: await TripController.injectData(
          resTrips.Items,
          event.requestContext.identity.cognitoIdentityId
        ),
        count: resTrips.Count,
        ...lastEvaluatedKey,
      };
      return { error: null, result };
    } catch (error) {
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
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
      const tripModel = new TripModel();
      await tripModel.add(params);
      const memberModel = new MemberModel();
      const addMemberParams = {
        memberId: data['ownerId'],
        tripId: params.id,
        isActive: true,
        isOwner: true,
        isMember: true,
        isFavorite: false,
        updatedAt: moment().unix(),
      };
      await memberModel.add(addMemberParams);
      return { error: null, result: params.id };
    } catch (error) {
      return { error };
    }
  }

  static async updateTrip(tripId, data) {
    try {
      const trip = { ...data, updatedAt: moment().unix() };
      trip['startDate'] = parseInt(data['startDate']);
      trip['endDate'] = parseInt(data['endDate']);
      const tripModel = new TripModel();
      if (trip['maxGroupSize']) {
        const tripDetails = await tripModel.get(tripId);
        if (!(tripDetails && tripDetails.Item)) throw 'Trip not found';
        trip['spotFilledRank'] = Math.round(
          (tripDetails.Item['groupSize'] / trip['maxGroupSize']) * 100
        );
        trip['isFull'] = trip['spotFilledRank'] == 100;
      }
      await tripModel.update(tripId, trip);
      return { error: null, result: 'success' };
    } catch (error) {
      return { error };
    }
  }

  static async getTrip(tripId) {
    try {
      const tripModel = new TripModel();
      const trip = await tripModel.get(tripId);
      return { error: null, result: trip.Item };
    } catch (error) {
      return { error };
    }
  }

  static async deleteTrip(tripId) {
    try {
      const tripModel = new TripModel();
      await tripModel.delete(tripId);
      return { error: null, result: 'success' };
    } catch (error) {
      return { error };
    }
  }

  static async myTrips(memberId) {
    try {
      const memberModel = new MemberModel();
      const resMembers = await memberModel.myTrips(memberId);
      const result = {
        data: await TripController.injectData(resMembers.Items),
        count: resMembers.Count,
      };
      return { error: null, result };
    } catch (error) {
      return { error };
    }
  }

  static async savedTrips(memberId) {
    try {
      const memberModel = new MemberModel();
      const resMembers = await memberModel.savedTrips(memberId);
      const result = {
        data: await TripController.injectData(resMembers.Items),
        count: resMembers.Count,
      };
      return { error: null, result };
    } catch (error) {
      return { error };
    }
  }

  static async injectData(trips, memberId) {
    const tripModel = new TripModel();
    const tripKeys = [];
    _.forEach(trips, item => {
      tripKeys.push({ id: item.tripId });
    });

    if (tripKeys.length > 0) {
      const resTrips = await tripModel.batchList(tripKeys);

      trips = await injectUserDetails(resTrips.Responses[TABLE_NAMES.TRIP]);
      trips = await injectFavoriteDetails(trips, memberId);
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

  static async injectFavoriteDetails(trips, userId) {
    const promises = [];
    const memberModel = new MemberModel();
    trips.map(trip => {
      promises.push(
        new Promise(async res => {
          if (!userId) {
            trip.isFavorite = false;
            return res(trip);
          }
          try {
            const result = await memberModel.get({
              tripId: trip.id,
              memberId: userId,
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
