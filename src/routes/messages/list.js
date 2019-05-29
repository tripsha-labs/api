/**
 * @name - list
 * @description - Message list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const get = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.MESSAGES,
    KeyConditionExpression: '#userId=:userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': event.requestContext.identity.cognitoIdentityId,
    },
    ScanIndexForward: false,
  };

  try {
    const resMessages = await executeQuery('query', params);
    return success({
      data: resMessages.Items,
      totalCount: resMessages.Count,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
