/**
 * @name - get
 * @description - Trip get handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const getTrip = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
  };
  try {
    const resTrip = await executeQuery('get', params);
    if (!resTrip.Item) throw ERROR_KEYS.ITEM_NOT_FOUND;
    const userParams = {
      TableName: TABLE_NAMES.USER,
      Key: {
        id: resTrip.Item.ownerId,
      },
    };
    const resUser = await executeQuery('get', userParams);
    const trip = resTrip.Item;
    trip['createdBy'] = resUser.Item;
    return success(trip);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.RESOURCE_NOT_FOUND);
  }
};
