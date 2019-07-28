/**
 * @name - list
 * @description - get user list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const searchUser = async (event, context) => {
  // Get search string from queryparams
  const searchText =
    event.queryStringParameters && event.queryStringParameters.search
      ? event.queryStringParameters.search
      : '';

  // Build nextpage token
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
    TableName: TABLE_NAMES.USER,
    Limit: 500,
    ProjectionExpression:
      'userId, email, firstName, lastName, avatarUrl, id, createdAt',
    FilterExpression: 'begins_with(#userId, :userId)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': _.lowerCase(searchText),
    },
    ...exclusiveStartKey,
  };
  try {
    const resUsers = await executeQuery('scan', params);
    const lastEvaluatedKey =
      resUsers && resUsers.LastEvaluatedKey
        ? {
            nextPageToken: Buffer.from(
              JSON.stringify(resUsers.LastEvaluatedKey)
            ).toString('base64'),
          }
        : {};
    const result = {
      data: resUsers.Items,
      count: resUsers.Count,
      ...lastEvaluatedKey,
    };
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
