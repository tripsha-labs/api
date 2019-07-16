/**
 * @name - checkExists
 * @description - checkExists handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const checkExist = async (event, context) => {
  const data = JSON.parse(event.body);
  if (!(data && data.userId)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'userId' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const params = {
    TableName: TABLE_NAMES.USER,
    FilterExpression: 'userId=:userId',
    ExpressionAttributeValues: {
      ':userId': data.userId,
    },
  };

  try {
    const result = await executeQuery('scan', params);
    return success({
      userExists: result && result.Items && result.Items.length > 0,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
