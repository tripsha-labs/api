/**
 * @name - delete
 * @description - delete user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES } from '../../constants';

export const deleteUser = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: event.requestContext.identity.cognitoIdentityId,
    },
  };

  try {
    await executeQuery('delete', params);
    return success('success');
  } catch (error) {
    return failure(error);
  }
};