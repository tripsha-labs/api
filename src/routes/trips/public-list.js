/**
 * @name - publicList
 * @description - Public trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';
import { queryBuilder, keyPrefixAlterer } from '../../helpers';

export const listPublicTrips = async (event, context) => {
  const data = {
    userId: event.requestContext.identity.cognitoIdentityId,
  };
  const params = {
    TableName: TABLE_NAMES.TRIP,
    KeyConditionExpression: queryBuilder(data),
    ExpressionAttributeValues: keyPrefixAlterer(data),
  };

  try {
    const resTrips = await executeQuery('query', params);
    return success(resTrips.Items);
  } catch (error) {
    return failure(error);
  }
};
