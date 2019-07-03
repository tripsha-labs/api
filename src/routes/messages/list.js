/**
 * @name - list
 * @description - Message list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const get = async (event, context) => {
  if (!(event.queryStringParameters && event.queryStringParameters.memberId)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'memberId' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  const params = {
    TableName: TABLE_NAMES.MESSAGES,
    ExpressionAttributeValues: {
      ':userId': event.requestContext.identity.cognitoIdentityId,
      ':memberId': event.queryStringParameters.memberId,
    },
    FilterExpression:
      '(toMemberId=:userId and fromMemberId=:memberId) or (toMemberId=:memberId and fromMemberId=:userId)',
  };

  try {
    const resMessages = await executeQuery('scan', params);
    return success({
      data: resMessages.Items,
      totalCount: resMessages.Count,
    });
  } catch (error) {
    console.error('Failed to list messages');
    console.error(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
