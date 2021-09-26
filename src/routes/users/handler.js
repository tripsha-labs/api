/**
 * @name - User handler
 * @description - This will handle user API requests
 */
import { Types } from 'mongoose';
import moment from 'moment';
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
import { createCognitoUser, setUserPassword } from '../../utils';
import { updateUserValidation, adminUpdateUserValidation } from '../../models';

/**
 * Invite Users
 */

export const inviteUser = async (event, context) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: event.requestContext.identity.cognitoIdentityId,
    });
    if (currentUser && currentUser.isAdmin) {
      const params = JSON.parse(event.body);
      if (!params.email) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };
      if (!params.password)
        throw {
          ...ERROR_KEYS.MISSING_FIELD,
          field: 'password',
        };
      const username = await _get_unique_username(
        params['email'],
        params['email'].split('@')[0]
      );
      params['username'] = username;
      params['isEmailVerified'] = true;
      const createUserInfo = {
        email: params.email,
        password: params.password,
        firstName: params.firstName || '',
        lastName: params.lastName || '',
      };
      const user_result = await createCognitoUser(event, createUserInfo);
      if (user_result) {
        delete params['password'];
        const user = await UserController.inviteUser(params);
        await subscribeUserToMailchimpAudience({
          name: createUserInfo.firstName + ' ' + createUserInfo.lastName,
          email: createUserInfo.email,
        });
        return success(user);
      } else {
        throw ERROR_KEYS.USER_ADD_FAILED;
      }
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
  } catch (error) {
    console.log(error);
    if (error.code === 'UsernameExistsException') {
      return failure(ERROR_KEYS.USER_ALREADY_EXISTS);
    }
    return failure(error);
  }
};

/**
 * Invite Users
 */

export const updateUserAdmin = async (event, context) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: event.requestContext.identity.cognitoIdentityId,
    });
    if (currentUser && currentUser.isAdmin) {
      const params = JSON.parse(event.body);
      const errors = adminUpdateUserValidation(params);
      if (errors != true) throw errors.shift();
      const user = await UserController.get({
        _id: Types.ObjectId(event.pathParameters.id),
      });
      if (params['password'] && params['password'] != '') {
        await setUserPassword(event, {
          password: params['password'],
          email: user.email,
        });
        delete params['password'];
      }
      await UserController.updateUserAdmin(event.pathParameters.id, params);
      return success('success');
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
/**
 * List users
 */
export const listUser = async (event, context) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: event.requestContext.identity.cognitoIdentityId,
    });
    if (
      currentUser &&
      (currentUser.isAdmin ||
        currentUser.isHost ||
        currentUser.isIdentityVerified)
    ) {
      const params = event.queryStringParameters
        ? event.queryStringParameters
        : {};
      const users = await UserController.listUser(params);
      return success(users);
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
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
    if (!userInfo) throw 'Create User failed';
    const createUserPayload = {
      email: userInfo.email,
    };
    if (userInfo.identities) {
      createUserPayload['isEmailVerified'] = true;
      createUserPayload['firstName'] = userInfo.given_name;
      createUserPayload['lastName'] = userInfo.family_name;
      createUserPayload['avatarUrl'] = userInfo.picture;
      try {
        await createCognitoUser(event, {
          ...createUserPayload,
          password:
            'T' +
            Math.random()
              .toString(30)
              .substr(2, 20),
        });
      } catch (err) {
        console.log('User already exists', err);
      }
    } else {
      if (userInfo.email_verified)
        createUserPayload['isEmailVerified'] = userInfo.email_verified;
      if (userInfo['custom:firstName'])
        createUserPayload['firstName'] = userInfo['custom:firstName'];
      if (userInfo['custom:lastName'])
        createUserPayload['lastName'] = userInfo['custom:lastName'];
      if (userInfo['custom:dob'])
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
    username = username + '_' + moment().format('X');
  }
  return username;
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

// TODO: Handle user account close/disable flow
export const deleteUser = async (event, context) => {};

export const isUserExists = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    if (!(data && data.username))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'username' };
    const result = await UserController.isExists({
      awsUserId: { $nin: [event.requestContext.identity.cognitoIdentityId] },
      username: data.username,
    });
    return success(result);
  } catch (error) {
    console.log(error);
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
