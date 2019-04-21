/**
 * @name - publicGet
 * @description - Public trip get handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const getPublicTrip = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
  };

  try {
    const resTrip = await executeQuery('get', params);
    if (resTrip.Item) {
      return success(resTrip.Item);
    } else {
      return failure('Item not found.');
    }
  } catch (error) {
    return failure(error);
  }
};
