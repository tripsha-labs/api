/**
 * @name - get
 * @description - Trip get handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const getTrip = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
  };
  try {
    const resTrip = await executeQuery('get', params);
    if (!resTrip.Item) throw ERROR_KEYS.ITEM_NOT_FOUND;
    return success(resTrip.Item);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.RESOURCE_NOT_FOUND);
  }
};
