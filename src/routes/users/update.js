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

  // Validate user fields against the strict schema
  const errors = updateUserValidation(data);
  if (errors != true) return failure(errors);

  // update data object with default fields and values ex. updatedAt
  const user = { ...data, ...updateUserDefaultValues };

  const params = {
    TableName: TABLE_NAMES.USER,
    Key: {
      id: event.requestContext.identity.cognitoIdentityId,
    },
    UpdateExpression: 'SET ' + queryBuilder(user),
    ExpressionAttributeValues: keyPrefixAlterer(user),
    ReturnValues: 'ALL_NEW',
  };

  try {
    const resUpdateUser = await executeQuery('update', params);
    return success(resUpdateUser.Item);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
