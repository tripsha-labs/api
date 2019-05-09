/**
 * @name - list
 * @description - Tag list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const get = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TAGS,
  };

  try {
    const resTags = await executeQuery('scan', params);
    return success({
      data: resTags.Items,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
