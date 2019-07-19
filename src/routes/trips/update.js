/**
 * @name - update
 * @description - Trip update handler (lambda function)
 */
import * as moment from 'moment';
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { updateTripValidation, validateTripLength } from '../../models';
import {
  queryBuilder,
  keyPrefixAlterer,
  errorSanitizer,
  getTripById,
} from '../../helpers';

export const updateTrip = async (event, context) => {
  const data = JSON.parse(event.body) || {};
  if (!(event.pathParameters && event.pathParameters.id)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  // Validate trip fields against the strict schema
  const errors = updateTripValidation(data);
  if (errors != true) return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  // update data object with default fields and values ex. updatedAt
  const trip = { ...data, updatedAt: moment().unix() };

  if (data['startDate'] || data['endDate']) {
    const tripLength = validateTripLength(data['startDate'], data['endDate']);

    if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength))
      return failure(ERROR_KEYS.INVALID_DATES, ERROR_CODES.VALIDATION_ERROR);
    trip['tripLength'] = tripLength;
    trip['startDate'] = parseInt(data['startDate']);
    trip['endDate'] = parseInt(data['endDate']);
  }
  if (trip['maxGroupSize']) {
    try {
      const tripDetails = await getTripById(event.pathParameters.id);
      if (!(tripDetails && tripDetails.Item)) throw 'TripNotFound';
      trip['spotFilledRank'] = Math.round(
        (tripDetails.Item['groupSize'] / trip['maxGroupSize']) * 100
      );
      trip['isFull'] = trip['spotFilledRank'] == 100;
    } catch (error) {
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
  }

  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
    UpdateExpression: 'SET ' + queryBuilder(trip),
    ExpressionAttributeValues: keyPrefixAlterer(trip),
    ReturnValues: 'ALL_NEW',
  };
  try {
    await executeQuery('update', params);
    return success('success');
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
