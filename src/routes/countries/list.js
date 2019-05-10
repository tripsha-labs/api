/**
 * @name - list
 * @description - Country list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import _ from 'lodash';

export const getCountries = async (event, context) => {
  let params = {
    TableName: TABLE_NAMES.COUNTRIES,
  };
  if (event.queryStringParameters && event.queryStringParameters.search) {
    const nameLower = _.lowerCase(event.queryStringParameters.search);
    const nameUpper = _.upperCase(event.queryStringParameters.search);
    params = {
      ...params,
      FilterExpression:
        'begins_with(#name, :nameLower) or begins_with(#name, :nameUpperFirst) or begins_with(#code, :nameUpper)',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#code': 'code',
      },
      ExpressionAttributeValues: {
        ':nameLower': nameLower,
        ':nameUpperFirst': _.upperFirst(nameLower),
        ':nameUpper': nameUpper,
      },
    };
  }

  try {
    const resCountries = await executeQuery('scan', params);
    return success({
      data: resCountries.Items,
    });
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
