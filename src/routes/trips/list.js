/**
 * @name - list
 * @description - Trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const listTrips = async (event, context) => {
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
  if (event.queryStringParameters) {
    filter['ScanIndexForward'] = event.queryStringParameters.sortOrder
      ? event.queryStringParameters.sortOrder
      : false;
    // Sort by earliest departure
    if (event.queryStringParameters.sortBy == 'earliestDeparture') {
      filter['IndexName'] = 'StartDateIndex';
      filter['ScanIndexForward'] =
        event.queryStringParameters.sortOrder == false ? false : true;
    }
    // Sort by most spots filled
    if (event.queryStringParameters.sortBy == 'mostSpotsFilled') {
      filter['IndexName'] = 'SpotsFilledIndex';
      filter['ScanIndexForward'] = event.queryStringParameters.sortOrder
        ? event.queryStringParameters.sortOrder
        : false;
    }

    // Budgets
    if (event.queryStringParameters.budgets) {
      const budgets = event.queryStringParameters.budgets.split(',');
      _.forEach(budgets, (value, key) => {
        filterAttributeValues.push({
          [':budgets' + key]: value,
        });
        filterExpressions.push('contains(budgets, :budgets' + key + ')');
      });
    }
    // minGroupSize
    if (event.queryStringParameters.minGroupSize) {
      filterAttributeValues.push({
        ':minGroupSize': parseInt(event.queryStringParameters.minGroupSize),
      });
      filterExpressions.push('minGroupSize >= :minGroupSize');
    }
    // maxGroupSize
    if (event.queryStringParameters.maxGroupSize) {
      filterAttributeValues.push({
        ':maxGroupSize': parseInt(event.queryStringParameters.maxGroupSize),
      });
      filterExpressions.push('maxGroupSize <= :maxGroupSize');
    }
    // minStartDate
    if (event.queryStringParameters.minStartDate) {
      filterAttributeValues.push({
        ':minStartDate': parseInt(event.queryStringParameters.minStartDate),
      });
      filterExpressions.push('startDate >= :minStartDate');
    }
    // endDate
    if (event.queryStringParameters.maxEndDate) {
      filterAttributeValues.push({
        ':maxEndDate': parseInt(event.queryStringParameters.maxEndDate),
      });
      filterExpressions.push('endDate <= :maxEndDate');
    }
    // minTripLength
    if (event.queryStringParameters.minTripLength) {
      filterAttributeValues.push({
        ':minTripLength': parseInt(event.queryStringParameters.minTripLength),
      });
      filterExpressions.push('tripLength >= :minTripLength');
    }
    // maxTripLength
    if (event.queryStringParameters.maxTripLength) {
      filterAttributeValues.push({
        ':maxTripLength': parseInt(event.queryStringParameters.maxTripLength),
      });
      filterExpressions.push('tripLength <= :maxTripLength');
    }
    // interests
    if (event.queryStringParameters.interests) {
      const interests = event.queryStringParameters.interests.split(',');
      _.forEach(interests, (value, key) => {
        filterAttributeValues.push({
          [':interests' + key]: value,
        });
        filterExpressions.push('contains(interests, :interests' + key + ')');
      });
    }
    // destinations
    if (event.queryStringParameters.destinations) {
      const destinations = event.queryStringParameters.destinations.split(',');
      _.forEach(destinations, (value, key) => {
        filterAttributeValues.push({
          [':destinations' + key]: value,
        });
        filterExpressions.push(
          'contains(destinations, :destinations' + key + ')'
        );
      });
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
    event.queryStringParameters && event.queryStringParameters.nextPageToken
      ? {
          ExclusiveStartKey: JSON.parse(
            Buffer.from(
              event.queryStringParameters.nextPageToken,
              'base64'
            ).toString('ascii')
          ),
        }
      : {};
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Limit: 1000,
    ...filter,
    ...exclusiveStartKey,
  };
  try {
    const resTrips = await executeQuery('query', params);
    const lastEvaluatedKey =
      resTrips && resTrips.LastEvaluatedKey
        ? {
            nextPageToken: Buffer.from(
              JSON.stringify(resTrips.LastEvaluatedKey)
            ).toString('base64'),
          }
        : {};
    const result = {
      data: resTrips.Items,
      count: resTrips.Count,
      ...lastEvaluatedKey,
    };
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
