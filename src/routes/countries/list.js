/**
 * @name - list
 * @description - Country list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const getCountries = async (event, context) => {
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
            // ':code': _.upperCase(searchText),
            ':pKey': 1,
          },
        }
      : { ExpressionAttributeValues: { ':pKey': 1 } };
  // Build attribute names
  const expressionAttributeNames =
    searchText != ''
      ? {
          KeyConditionExpression:
            '#pKey=:pKey and begins_with(#nameLower, :nameLower)',
          ExpressionAttributeNames: {
            // '#code': 'code',
            '#nameLower': 'nameLower',
            '#pKey': 'pKey',
          },
          // FilterExpression: 'begins_with(#code, :code)',
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
    TableName: TABLE_NAMES.COUNTRIES,
    ...expressionAttributeNames,
    ...expressionAttributeValues,
    ScanIndexForward: true,
    Limit: 500,
    ...exclusiveStartKey,
  };

  try {
    const resCountries = await executeQuery('query', params);
    const lastEvaluatedKey =
      resCountries && resCountries.LastEvaluatedKey
        ? {
            nextPageToken: Buffer.from(
              JSON.stringify(resCountries.LastEvaluatedKey)
            ).toString('base64'),
          }
        : {};
    const result = {
      data: resCountries.Items,
      count: resCountries.Count,
      ...lastEvaluatedKey,
    };
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
