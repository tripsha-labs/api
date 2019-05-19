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
  // Convert to lowercase and uppercase format
  const nameLower = _.lowerCase(searchText);
  const nameUpper = _.upperCase(searchText);
  // Build attribute values
  const expressionAttributeValues =
    searchText != ''
      ? {
          ':nameLower': nameLower,
          ':nameUpperFirst': _.upperFirst(nameLower),
          ':nameUpper': nameUpper,
        }
      : {};
  // Build attribute names
  const expressionAttributeNames =
    searchText != ''
      ? {
          ExpressionAttributeNames: {
            '#name': 'name',
            '#code': 'code',
          },
          FilterExpression:
            'begins_with(#name, :nameLower) or begins_with(#name, :nameUpperFirst) or begins_with(#code, :nameUpper)',
        }
      : {};
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
    KeyConditionExpression: 'pKey = :value',
    ...expressionAttributeNames,
    ExpressionAttributeValues: {
      ':value': 1,
      ...expressionAttributeValues,
    },
    ScanIndexForward: true,
    Limit: 25,
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
