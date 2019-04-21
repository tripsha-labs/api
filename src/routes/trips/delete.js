/**
 * @name - delete
 * @description - Trip delete handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const deleteTrip = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      // userId: event.requestContext.identity.cognitoIdentityId,
      id: event.pathParameters.id,
    },
  };

  try {
    await executeQuery('delete', params);
    return success('success');
  } catch (error) {
    return failure(error);
  }
};
