/**
 * @name - update
 * @description - Trip update handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';
import { updateTripValidation, updateTripDefaultValues } from '../../models';
import { queryBuilder, keyPrefixAlterer } from '../../helpers';

export const updateTrip = async (event, context) => {
  const data = JSON.parse(event.body);

  // Validate trip fields against the strict schema
  const errors = updateTripValidation(data);
  if (errors != true) return failure(errors);

  // update data object with default fields and values ex. updatedAt
  data = { ...data, ...updateTripDefaultValues };

  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      // userId: event.requestContext.identity.cognitoIdentityId,
      id: event.pathParameters.id,
    },
    UpdateExpression: 'SET ' + queryBuilder(data),
    ExpressionAttributeValues: keyPrefixAlterer(data),
    ReturnValues: 'ALL_NEW',
  };

  try {
    await executeQuery('update', params);
    return success('success');
  } catch (error) {
    return failure(error);
  }
};
