/**
 * @name - get
 * @description - get user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const getUser = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  const userId =
    event.queryStringParameters.id == 'me'
      ? event.requestContext.identity.cognitoIdentityId
      : event.queryStringParameters.id;
  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: userId,
    },
  };

  try {
    const result = await executeQuery('get', params);
    if (!result.Item) throw 'Item not found.';
    return success(result.Item);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
