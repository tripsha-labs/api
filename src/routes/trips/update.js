/**
 * @name - update
 * @description - Trip update handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { updateTripValidation, updateTripDefaultValues } from '../../models';
import { queryBuilder, keyPrefixAlterer, errorSanitizer } from '../../helpers';

export const updateTrip = async (event, context) => {
  const data = JSON.parse(event.body);

  // Validate trip fields against the strict schema
  const errors = updateTripValidation(data);
  if (errors != true) return failure(errors, ERROR_CODES.VALIDATION_ERROR);

  // update data object with default fields and values ex. updatedAt
  const trip = { ...data, ...updateTripDefaultValues };
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      // userId: event.requestContext.identity.cognitoIdentityId,
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
