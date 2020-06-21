/**
 * @name - User handler
 * @description - This will handle user API requests
 */
import urldecode from 'urldecode';
import { UserController } from './user.ctrl';
import { MessageController } from '../messages/message.ctrl';
import {
  success,
  failure,
  subscribeUserToMailchimpAudience,
  unsubscribeUserToMailchimpAudience,
} from '../../utils';
import { ERROR_KEYS, APP_CONSTANTS } from '../../constants';
import { generateRandomNumber } from '../../helpers';

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
    const result = await UserController.getUser(urldecode(userId), {
      stripeAccountId: 0,
    });
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
    // Generate username
    let username = data['email'].split('@')[0];
    let userExists = await UserController.isExists({ username: username });
    if (userExists) {
      username = username + generateRandomNumber();
      userExists = await UserController.isExists({ username: username });
      if (userExists) {
        username = username + generateRandomNumber();
      }
    }
    userExists = await UserController.isExists({ email: data['email'] });
    let result = {};
    if (userExists) {
      result = await UserController.updateUserByEmail(data['email'], {
        ...data,
        username: username,
        awsUserId: event.requestContext.identity.cognitoIdentityId,
      });
    } else {
      result = await UserController.createUser({
        ...data,
        username: username,
        awsUserId: event.requestContext.identity.cognitoIdentityId,
      });

      await subscribeUserToMailchimpAudience({
        name: data.firstName + ' ' + data.lastName,
        email: data.email,
      });
    }

    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Get user by username
 */
export const getUserByUsername = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.username))
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'username' };

  const username = event.pathParameters.username;
  try {
    const result = await UserController.get(
      {
        username: username,
      },
      { stripeCustomerId: 0, stripeAccountId: 0 }
    );
    return success(result);
  } catch (error) {
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
    // Add support user in the conversation
    await MessageController.addSupportMember(urldecode(id));
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Sign in user
 */
export const signin = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    await UserController.get({
      email: data.email,
    });
    return success('success');
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

export const subscribeUser = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    if (!(data && data.email))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };
    try {
      await subscribeUserToMailchimpAudience({
        name: '',
        email: data.email,
        audienceListId: APP_CONSTANTS.MATCHES_ID,
      });
    } catch (error) {
      console.log(error);
    }

    return success('success');
  } catch (error) {
    return failure(error);
  }
};

export const unsubscribeUser = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    if (!(data && data.email))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };
    try {
      await unsubscribeUserToMailchimpAudience({
        name: '',
        email: data.email,
        audienceListId: APP_CONSTANTS.MATCHES_ID,
      });
    } catch (error) {
      console.log(error);
    }

    return success('success');
  } catch (error) {
    return failure(error);
  }
};
