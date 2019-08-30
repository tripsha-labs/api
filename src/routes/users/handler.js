import urldecode from 'urldecode';
import { UserController } from './user.ctrl';
import { success, failure } from '../../utils';
import { ERROR_KEYS } from '../../constants';

import { createUserValidation, updateUserValidation } from '../../models';

/**
 * List users
 */
export const listUser = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const users = await UserController.listUser(params);
    return success(users);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Get user
 */
export const getUser = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id))
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

  const userId =
    event.pathParameters.id == 'me'
      ? event.requestContext.identity.cognitoIdentityId
      : event.pathParameters.id;
  try {
    const result = await UserController.getUser(urldecode(userId));
    return success(result);
  } catch (error) {
    return failure(error);
  }
};

/**
 * Create user
 */
export const createUser = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    // Validate user fields against the strict schema
    const errors = createUserValidation(data);
    if (errors != true) throw errors.shift();

    const result = await UserController.createUser({
      ...data,
      awsUserId: event.requestContext.identity.cognitoIdentityId,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Update user
 */
export const updateUser = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const id =
      event.pathParameters.id === 'me'
        ? event.requestContext.identity.cognitoIdentityId
        : event.pathParameters.id;
    const data = JSON.parse(event.body);
    const errors = updateUserValidation(data);
    if (errors != true) throw errors.shift();

    const result = await UserController.updateUser(urldecode(id), {
      ...data,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

// TODO: Handle user account close/disable flow
export const deleteUser = async (event, context) => {};

export const isUserExists = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    if (!(data && data.username))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'username' };
    const result = await UserController.isExists(
      data.username,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    return failure(error);
  }
};
