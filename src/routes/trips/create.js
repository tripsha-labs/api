/**
 * @name - create
 * @description - Trip create handler (lambda function)
 */
import uuid from 'uuid';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { createTripValidation, createTripDefaultValues } from '../../models';
import { errorSanitizer } from '../../helpers';

export const createTrip = async (event, context) => {
  const data = JSON.parse(event.body);
  // Validate trip fields against the strict schema
  const errors = createTripValidation(data);
  if (errors != true) {
    return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  }

  const params = {
    TableName: TABLE_NAMES.TRIP,
    Item: {
      ...data, // validated data
      ...createTripDefaultValues, // default values
      userId: event.requestContext.identity.cognitoIdentityId,
      id: uuid.v1(),
    },
    ReturnValues: 'ALL_OLD',
  };

  try {
    await executeQuery('put', params);
    return success(params.Item);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
