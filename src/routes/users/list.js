/**
 * @name - list
 * @description - list user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const listUsers = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.USER,
    // KeyConditionExpression: 'id = :id',
    // ExpressionAttributeValues: {
    //   ':id': event.requestContext.identity.cognitoIdentityId,
    // },
  };

  try {
    const resUsers = await executeQuery('scan', params);
    return success({
      data: resUsers.Items,
      totalCount: resUsers.ScannedCount,
      currentCount: resUsers.Count,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
