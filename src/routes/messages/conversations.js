/**
 * @name - conversations
 * @description - Conversation list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const get = async (event, context) => {
  const exclusiveStartKey =
    event.queryStringParameters && event.queryStringParameters.nextPageToken
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
    TableName: TABLE_NAMES.CONVERSATIONS,
    ExpressionAttributeValues: {
      ':userId': event.requestContext.identity.cognitoIdentityId,
      ':groupId':
        event.queryStringParameters && event.queryStringParameters.groupId
          ? event.queryStringParameters.groupId
          : '1',
    },
    KeyConditionExpression: 'groupId=:groupId',
    FilterExpression: 'toMemberId=:userId or fromMemberId=:userId',
    ScanIndexForward: true,
    Limit: 5000,
    ...exclusiveStartKey,
  };

  try {
    const resMessages = await executeQuery('query', params);
    const result = {
      data: [],
      count: 0,
    };
    if (resMessages && resMessages.Items && resMessages.Items.length > 0) {
      if (resMessages.LastEvaluatedKey)
        result['nextPageToken'] = Buffer.from(
          JSON.stringify(resMessages.LastEvaluatedKey)
        ).toString('base64');

      const promises = [];
      resMessages.Items.map(message => {
        promises.push(
          new Promise(async resolve => {
            const memberId =
              message['toMemberId'] ==
              event.requestContext.identity.cognitoIdentityId
                ? message['fromMemberId']
                : message['toMemberId'];
            const userParams = {
              TableName: TABLE_NAMES.USER,
              Key: {
                id: memberId,
              },
            };
            let user = {};
            try {
              const resultUser = await executeQuery('get', userParams);
              user = resultUser.Item;
            } catch (error) {
              console.log(error);
            }
            user['message'] = message;
            return resolve(user);
          })
        );
      });
      const resConversations = await Promise.all(promises);
      result['data'] = resConversations;
      result['count'] = resMessages.Count;
    }

    return success(result);
  } catch (error) {
    console.error('Failed to list messages');
    console.error(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
