/**
 * @name - list
 * @description - Tag list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const get = async (event, context) => {
  let params = {
    TableName: TABLE_NAMES.TAGS,
    Limit: 25,
    ScanIndexForward: true,
  };

  if (event.queryStringParameters && event.queryStringParameters.search) {
    const nameLower = _.lowerCase(event.queryStringParameters.search);
    params = {
      ...params,
      FilterExpression:
        'begins_with(#name, :nameLower) or begins_with(#name, :nameUpperFirst)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':nameLower': nameLower,
        ':nameUpperFirst': _.upperFirst(nameLower),
      },
      Limit: 100,
    };
  }
  if (
    event.queryStringParameters &&
    event.queryStringParameters.nextPageToken
  ) {
    params = {
      ...params,
      ExclusiveStartKey: JSON.parse(
        Buffer.from(
          event.queryStringParameters.nextPageToken,
          'base64'
        ).toString('ascii')
      ),
    };
  }

  try {
    const resTags = await executeQuery('scan', params);
    let result = {
      data: resTags.Items,
      count: resTags.Count,
    };
    if (resTags.LastEvaluatedKey) {
      result = {
        ...result,
        nextPageToken: Buffer.from(
          JSON.stringify(resTags.LastEvaluatedKey)
        ).toString('base64'),
      };
    }
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
