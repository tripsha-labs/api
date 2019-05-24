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
    data['createdBy'] = {
      firstName: user['firstName'] || '',
      lastName: user['lastName'] || '',
      avatarUrl: user['avatarUrl'] || '',
      gender: user['gender'] || '',
    };
  } catch (error) {
    return failure(ERROR_KEYS.ITEM_NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
  }
  const tripLength = validateTripLength(data['startDate'], data['endDate']);
  if (tripLength <= 0 || tripLength > 365)
    return failure(ERROR_KEYS.INVALID_DATES, ERROR_CODES.VALIDATION_ERROR);
  data['tripLength'] = tripLength;
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Item: {
      ...data, // validated data
      ...createTripDefaultValues, // default values
      ownerId: event.requestContext.identity.cognitoIdentityId,
    },
    ReturnValues: 'ALL_OLD',
  };

  try {
    await executeQuery('put', params);
    return success(params.Item.id);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
