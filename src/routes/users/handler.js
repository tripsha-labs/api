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
  getCurrentUser,
} from '../../utils';
import { ERROR_KEYS, APP_CONSTANTS } from '../../constants';
import { generateRandomNumber } from '../../helpers';

import { updateUserValidation } from '../../models';
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
 * Create user
 */
export const createUser = async (event, context) => {
  try {
    const userInfo = await getCurrentUser(event);
    console.log(userInfo);
    if (!userInfo) throw 'Create User failed';
    const createUserPayload = {
      email: userInfo.email,
      isEmailVerified: userInfo.email_verified,
    };
    if (userInfo.identities) {
      createUserPayload['firstName'] = userInfo.given_name;
      createUserPayload['lastName'] = userInfo.family_name;
      createUserPayload['avatarUrl'] = userInfo.picture;
    } else {
      createUserPayload['firstName'] = userInfo['custom:firstName'];
      createUserPayload['lastName'] = userInfo['custom:lastName'];
      createUserPayload['dob'] = userInfo['custom:dob'];
    }
    let user = false;
    try {
      user = await UserController.get({
        email: createUserPayload['email'],
      });
    } catch (err) {
      user = false;
    }
    let result = null;
    if (user) {
      if (
        Array.isArray(user.awsUserId) &&
        user.awsUserId.indexOf(userInfo.awsUserId) === -1
      ) {
        user.awsUserId.push(userInfo.awsUserId);
        createUserPayload['awsUserId'] = user.awsUserId;
      } else if (
        Array.isArray(user.awsUserId) &&
        user.awsUserId.indexOf(userInfo.awsUserId) > -1
      ) {
        createUserPayload['awsUserId'] = user.awsUserId;
      } else if (typeof user.awsUserId == 'string') {
        user.awsUserId != userInfo.awsUserId;

        createUserPayload['awsUserId'] =
          user.awsUserId != userInfo.awsUserId
            ? [user.awsUserId, userInfo.awsUserId]
            : [userInfo.awsUserId];
      }
      result = await UserController.updateUserByEmail(
        user.email,
        createUserPayload
      );
    } else {
      const username = await _get_unique_username(
        createUserPayload['email'],
        createUserPayload['email'].split('@')[0]
      );
      createUserPayload['username'] = username;
      createUserPayload['awsUserId'] = [userInfo.awsUserId];
      console.log(createUserPayload);
      result = await UserController.createUser(createUserPayload);
      await subscribeUserToMailchimpAudience({
        name: createUserPayload.firstName + ' ' + createUserPayload.lastName,
        email: createUserPayload.email,
      });
    }

    return success(result);
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
    if (event.pathParameters.id != 'me') {
      return failure(error);
    }
  }
  console.log('User not found creating new user');
  try {
    await createUser(event, context);
    const result = await UserController.getUser(urldecode(userId), {
      stripeAccountId: 0,
    });
    return success(result);
  } catch (err) {
    return failure(err);
  }
};

const _get_unique_username = async (email, username) => {
  let userExists = await UserController.isExists({
    username: username,
    email: { $ne: email },
  });
  if (userExists) {
    username = username + generateRandomNumber();
    _get_unique_username(email, username);
  } else {
    return username;
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
    const user = await UserController.get({
      email: data.email,
    });
    if (
      user &&
      user.awsUserId === event.requestContext.identity.cognitoIdentityId
    )
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
