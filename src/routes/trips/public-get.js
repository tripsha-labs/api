/**
 * @name - publicGet
 * @description - Public trip get handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const getPublicTrip = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
  };

  try {
    const resTrip = await executeQuery('get', params);
    if (!resTrip.Item) throw 'Item not found.';
    return success(resTrip.Item);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
