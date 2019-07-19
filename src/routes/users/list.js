/**
 * @name - list
 * @description - get user list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const listUser = async (event, context) => {
  // Get search string from queryparams
  const searchText =
    event.queryStringParameters && event.queryStringParameters.search
      ? event.queryStringParameters.search
      : '';
  // Build attribute values
  const expressionAttributeValues =
    searchText != ''
      ? {
          ExpressionAttributeValues: {
            ':userId': _.lowerCase(searchText),
            ':isActive': 1,
          },
        }
      : { ExpressionAttributeValues: { ':isActive': 1 } };
  const expressionAttributeNames =
    searchText != ''
      ? {
          ExpressionAttributeNames: {
            '#userId': 'userId',
            '#email': 'email',
            '#isActive': 'isActive',
          },
          KeyConditionExpression: '#isActive=:isActive',
          FilterExpression:
            'begins_with(#userId, :userId) or begins_with(#email, :userId)',
        }
      : {
          ExpressionAttributeNames: {
            '#isActive': 'isActive',
          },
          KeyConditionExpression: '#isActive=:isActive',
        };
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
    IndexName: 'SortByUsername',
    ScanIndexForward: true,
    Limit: 500,
    ...expressionAttributeNames,
    ...expressionAttributeValues,
    ...exclusiveStartKey,
  };
  try {
    const resUsers = await executeQuery('query', params);
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
