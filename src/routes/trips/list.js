/**
 * @name - list
 * @description - Trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';
import { queryBuilder, keyPrefixAlterer } from '../../helpers';

export const listTrips = async (event, context) => {
  const data = {
    userId: event.requestContext.identity.cognitoIdentityId,
  };

  const params = {
    TableName: TABLE_NAMES.TRIP,
    // ProjectionExpression: 'title, createdAt',
    FilterExpression: '#userId=:userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': event.requestContext.identity.cognitoIdentityId,
    },
  };

  try {
    const resTrips = await executeQuery('scan', params);
    return success({
      data: resTrips.Items,
      totalCount: resTrips.ScannedCount,
      current_count: resTrips.Count,
    });
  } catch (error) {
    return failure(error);
  }
};
