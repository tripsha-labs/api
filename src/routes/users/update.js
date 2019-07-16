/**
 * @name - update
 * @description - update user handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { updateUserValidation, updateUserDefaultValues } from '../../models';
import { queryBuilder, keyPrefixAlterer, errorSanitizer } from '../../helpers';

export const updateUser = async (event, context) => {
  const data = JSON.parse(event.body);
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
  // Validate user fields against the strict schema
  const errors = updateUserValidation(data);
  if (errors != true) return failure(errors, ERROR_CODES.VALIDATION_ERROR);

  // update data object with default fields and values ex. updatedAt
  const user = { ...data, ...updateUserDefaultValues };
  if (user.hasOwnProperty('isActive'))
    user['isActive'] = user['isActive'] == 'false' ? 0 : 1;
  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: userId,
    },
    UpdateExpression: 'SET ' + queryBuilder(user),
    ExpressionAttributeValues: keyPrefixAlterer(user),
    ReturnValues: 'ALL_NEW',
  };
  try {
    const resUpdateUser = await executeQuery('update', params);
    return success('success');
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
