/**
 * @name - create
 * @description - Trip create handler (lambda function)
 */

import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { getUserById } from '../../helpers';
import {
  createTripValidation,
  createTripDefaultValues,
  validateTripLength,
} from '../../models';
import { errorSanitizer } from '../../helpers';

export const createTrip = async (event, context) => {
  const data = JSON.parse(event.body) || {};
  // Validate trip fields against the strict schema
  const errors = createTripValidation(data);
  if (errors != true) {
    return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  }
  try {
    const user = await getUserById(
      event.requestContext.identity.cognitoIdentityId
    );
    if (!user) throw 'UserNotFound';
    data['createdBy'] = {
      firstName: user['firstName'] || '',
      lastName: user['lastName'] || '',
      avatarUrl: user['avatarUrl'] || '',
    };
  } catch (error) {
    return failure(ERROR_KEYS.ITEM_NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
  }
  const tripLength = validateTripLength(data['startDate'], data['endDate']);
  if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength)) {
    return failure(ERROR_KEYS.INVALID_DATES, ERROR_CODES.VALIDATION_ERROR);
  }
  data['startDate'] = parseInt(data['startDate']);
  data['endDate'] = parseInt(data['endDate']);
  data['groupSize'] = 1;
  data['tripLength'] = tripLength;
  data['spotFilledRank'] = Math.round(
    (data['groupSize'] / data['maxGroupSize']) * 100
  );
  data['isFull'] = data['spotFilledRank'] == 100;
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Item: {
      ...data, // validated data
      ...createTripDefaultValues, // default values
      ownerId: event.requestContext.identity.cognitoIdentityId,
    },
    ReturnValues: 'ALL_OLD',
  };
  console.log(params);
  try {
    await executeQuery('put', params);
    return success(params.Item.id);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
