/**
 * @name - list
 * @description - Country list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const getCountries = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.COUNTRIES,
  };
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
