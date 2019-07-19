/**
 * @name - create
 * @description - User create handler (lambda function)
 */

import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { createUserValidation, createUserDefaultValues } from '../../models';
import { errorSanitizer, getUserByUserID } from '../../helpers';

export const createUser = async (event, context) => {
  const data = JSON.parse(event.body);

  // Validate user fields against the strict schema
  const errors = createUserValidation(data);
  if (errors != true) return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  // Check user already exists
  try {
    const user = await getUserByUserID(data.userId);
    if (user && user.Items && user.Items.length > 0) {
      throw 'UserIdAlreadyExists';
    }
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
  const params = {
    TableName: TABLE_NAMES.USER,
    Item: {
      ...data, // validated data
      ...createUserDefaultValues, // default values
      id: event.requestContext.identity.cognitoIdentityId, // user cognito id
    },
  };
  try {
    await executeQuery('put', params);
    return success(params.Item.id);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
