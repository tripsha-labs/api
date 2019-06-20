/**
 * @name - delete
 * @description - Trip delete handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

export const deleteTrip = async (event, context) => {
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
    ConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': event.requestContext.identity.cognitoIdentityId,
    },
  };

  try {
    await executeQuery('delete', params);
    return success('success');
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
