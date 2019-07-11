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
  const exclusiveStartKey = event.queryStringParameters.nextPageToken
    ? {
        ExclusiveStartKey: JSON.parse(
          Buffer.from(
            event.queryStringParameters.nextPageToken,
            'base64'
          ).toString('ascii')
        ),
      }
    : {};
  const params = {
    TableName: TABLE_NAMES.MESSAGES,
    ExpressionAttributeValues: {
      ':userId': event.requestContext.identity.cognitoIdentityId,
      ':memberId': event.queryStringParameters.memberId,
      ':groupId': event.queryStringParameters.groupId
        ? event.queryStringParameters.groupId
        : '1',
    },
    KeyConditionExpression: 'groupId=:groupId',
    FilterExpression:
      '(toMemberId=:userId and fromMemberId=:memberId) or (toMemberId=:memberId and fromMemberId=:userId)',
    ScanIndexForward: true,
    Limit: 1000,
    ...exclusiveStartKey,
  };
  console.log(params);
  try {
    const resMessages = await executeQuery('query', params);
    const lastEvaluatedKey =
      resMessages && resMessages.LastEvaluatedKey
        ? {
            nextPageToken: Buffer.from(
              JSON.stringify(resMessages.LastEvaluatedKey)
            ).toString('base64'),
          }
        : {};
    let result = {
      data: resMessages.Items,
      count: resMessages.Count,
      ...lastEvaluatedKey,
    };
    return success(result);
  } catch (error) {
    console.error('Failed to list messages');
    console.error(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
