/**
 * @name - list
 * @description - Trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const listTrips = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': event.requestContext.identity.cognitoIdentityId,
    },
  };

  try {
    const resTrips = await executeQuery('query', params);
    return success(resTrips.Items);
  } catch (error) {
    return failure(error);
  }
};
