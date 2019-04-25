/**
 * @name - delete
 * @description - delete user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

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
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
