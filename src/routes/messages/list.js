/**
 * @name - list
 * @description - Trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const get = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.MESSAGES,
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
      totalCount: resTrips.Count,
      current_count: resTrips.Count,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
