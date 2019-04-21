/**
 * @name - get
 * @description - Trip get handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const getTrip = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      id: event.pathParameters.id,
    },
  };

  try {
    const resTrip = await executeQuery('get', params);
    if (!resTrip.Item) throw 'Item not found.';
    return success(resTrip.Item);
  } catch (error) {
    return failure(error);
  }
};
