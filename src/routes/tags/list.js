/**
 * @name - list
 * @description - Tag list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const get = async (event, context) => {
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
            ':nameLower': _.lowerCase(searchText),
            ':pKey': 1,
          },
        }
      : { ExpressionAttributeValues: { ':pKey': 1 } };
  // Build attribute names
  const expressionAttributeNames =
    searchText != ''
      ? {
          ExpressionAttributeNames: {
            '#nameLower': 'nameLower',
            '#pKey': 'pKey',
          },
          KeyConditionExpression:
            '#pKey=:pKey and begins_with(#nameLower, :nameLower)',
        }
      : {
          ExpressionAttributeNames: {
            '#pKey': 'pKey',
          },
          KeyConditionExpression: '#pKey=:pKey',
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
    TableName: TABLE_NAMES.TAGS,
    ...expressionAttributeNames,
    ...expressionAttributeValues,
    ScanIndexForward: true,
    Limit: 500,
    ...exclusiveStartKey,
  };

  try {
    const resTags = await executeQuery('query', params);
    const lastEvaluatedKey =
      resTags && resTags.LastEvaluatedKey
        ? {
            nextPageToken: Buffer.from(
              JSON.stringify(resTags.LastEvaluatedKey)
            ).toString('base64'),
          }
        : {};
    let result = {
      data: resTags.Items,
      count: resTags.Count,
      ...lastEvaluatedKey,
    };
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
