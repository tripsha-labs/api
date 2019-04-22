/**
 * @name - list
 * @description - list user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const listUsers = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.USER,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': event.requestContext.identity.cognitoIdentityId,
    },
  };

  try {
    const resUsers = await executeQuery('query', params);
    return success(resUsers);
  } catch (error) {
    return failure(error);
  }
};
