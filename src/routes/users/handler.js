import { UserController } from './user.ctrl';
import { success, failure } from '../../utils';
import { errorSanitizer } from '../../helpers';
import { ERROR_CODES } from '../../constants';
import urldecode from 'urldecode';

/**
 * List users
 */
export const listUser = async (event, context) => {
  try {
    const { error, result } = await UserController.listUser({
      // searchText:
      //   event.queryStringParameters && event.queryStringParameters.search,
    });
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Get user
 */
export const getUser = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id))
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  const userId =
    event.pathParameters.id == 'me'
      ? event.requestContext.identity.cognitoIdentityId
      : event.pathParameters.id;
  try {
    const { error, result } = await UserController.getUser(urldecode(userId));
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Create user
 */
export const createUser = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const { error, result } = await UserController.createUser({
      ...data,
      id: event.requestContext.identity.cognitoIdentityId,
    });
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Update user
 */
export const updateUser = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id))
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  const id =
    event.pathParameters.id == 'me'
      ? event.requestContext.identity.cognitoIdentityId
      : event.pathParameters.id;

  try {
    const data = JSON.parse(event.body);
    const { error, result } = await UserController.updateUser(urldecode(id), {
      ...data,
    });
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

// TODO: Handle user account close/disable flow
export const deleteUser = async (event, context) => {};
