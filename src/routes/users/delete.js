/**
 * @name - delete
 * @description - delete user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const deleteUser = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  const userId =
    event.pathParameters.id == 'me'
      ? event.requestContext.identity.cognitoIdentityId
      : event.pathParameters.id;
  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: userId,
    },
  };

  try {
    await executeQuery('delete', params);
    return success('success');
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
