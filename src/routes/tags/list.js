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
    };
  }

  try {
    const resTags = await executeQuery('scan', params);
    return success({
      data: resTags.Items,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
