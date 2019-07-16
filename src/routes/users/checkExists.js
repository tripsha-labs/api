/**
 * @name - checkExists
 * @description - checkExists handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const checkExist = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.userId)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'userId' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  const userId =
    event.pathParameters.id == 'me'
      ? event.requestContext.identity.cognitoIdentityId
      : event.pathParameters.id;
  const params = {
    TableName: TABLE_NAMES.USER,
    FilterExpression: 'userId=:userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const result = await executeQuery('scan', params);
    return success({
      exists: result && result.Items && result.Items.length > 0,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
