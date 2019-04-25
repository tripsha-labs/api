/**
 * @name - publicList
 * @description - Public trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { queryBuilder, keyPrefixAlterer, errorSanitizer } from '../../helpers';

export const listPublicTrips = async (event, context) => {
  // const data = {
  //   userId: event.requestContext.identity.cognitoIdentityId,
  // };
  const params = {
    TableName: TABLE_NAMES.TRIP,
    // ProjectionExpression: 'title, createdAt',
    // FilterExpression: '#userId=:userId',
    // ExpressionAttributeNames: {
    //   '#userId': 'userId',
    // },
    // ExpressionAttributeValues: {
    //   ':userId': event.requestContext.identity.cognitoIdentityId,
    // },
  };

  try {
    const resTrips = await executeQuery('scan', params);
    return success({
      data: resTrips.Items,
      totalCount: resTrips.ScannedCount,
      currentCount: resTrips.Count,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
