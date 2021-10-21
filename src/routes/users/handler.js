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
  successResponse,
  failureResponse,
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

export const inviteUser = async (req, res) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    if (currentUser && currentUser.isAdmin) {
      const params = req.body;
      if (!params.email) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };
      if (!params.password)
        throw {
          ...ERROR_KEYS.MISSING_FIELD,
          field: 'password',
        };
      params['email'] = params['email'].toLowerCase();
      params['username'] = params['username'] || params['email'].split('@')[0];
      const exists = await _check_username_exists(
        params['email'],
        params['username']
      );
      if (exists) throw ERROR_KEYS.USERNAME_ALREADY_EXISTS;
      params['isEmailVerified'] = true;
      const createUserInfo = {
        email: params.email,
        password: params.password,
        firstName: params.firstName || '',
        lastName: params.lastName || '',
      };
      const user_result = await createCognitoUser(req, createUserInfo);
      if (user_result) {
        delete params['password'];
        const user = await UserController.inviteUser(params);
        await subscribeUserToMailchimpAudience({
          name: createUserInfo.firstName + ' ' + createUserInfo.lastName,
          email: createUserInfo.email,
        });
        return successResponse(res, user);
      } else {
        throw ERROR_KEYS.USER_ADD_FAILED;
      }
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
  } catch (error) {
    console.log(error);
    if (error.code === 'UsernameExistsException') {
      return failureResponse(res, ERROR_KEYS.USER_ALREADY_EXISTS);
    }
    return failureResponse(res, error);
  }
};

/**
 * User update by admin
 */

export const updateUserAdmin = async (req, res) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    if (currentUser && currentUser.isAdmin) {
      const params = req.body;
      const errors = adminUpdateUserValidation(params);
      if (errors != true) throw errors.shift();
      const user = await UserController.get({
        _id: Types.ObjectId(req.params.id),
      });
      if (params.username) {
        const exists = await _check_username_exists(
          user['email'],
          params['username']
        );
        if (exists) throw ERROR_KEYS.USERNAME_ALREADY_EXISTS;
      }

      if (params['password'] && params['password'] != '') {
        await setUserPassword(req, {
          password: params['password'],
          email: user.email.toLowerCase(),
        });
        delete params['password'];
      }
      await UserController.updateUserAdmin(req.params.id, params);
      return successResponse(res, 'success');
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * List users
 */
export const listUser = async (req, res) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    if (
      currentUser &&
      (currentUser.isAdmin ||
        currentUser.isHost ||
        currentUser.isIdentityVerified)
    ) {
      const params = req.query ? req.query : {};
      const users = await UserController.listUser(params);
      return successResponse(res, users);
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * Create user
 */
export const createUser = async (req, res) => {
  try {
    const userInfo = await getCurrentUser(req);
    if (!userInfo) throw 'Create User failed';
    userInfo['email'] = userInfo['email'].toLowerCase();
    const createUserPayload = {
      email: userInfo.email,
    };
    if (userInfo.identities) {
      createUserPayload['isEmailVerified'] = true;
      createUserPayload['firstName'] = userInfo.given_name;
      createUserPayload['lastName'] = userInfo.family_name;
      createUserPayload['avatarUrl'] = userInfo.picture;
      try {
        await createCognitoUser(req, {
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
      if (userInfo['username']) {
        const exists = await _check_username_exists(
          userInfo['email'],
          userInfo['username']
        );
        if (exists) throw ERROR_KEYS.USERNAME_ALREADY_EXISTS;
      }
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
      createUserPayload['isEmailVerified'] = true;
      result = await UserController.updateUserByEmail(
        user.email,
        createUserPayload
      );
    } else {
      const username = await _get_unique_username(
        createUserPayload['email'],
        userInfo.username || createUserPayload['email'].split('@')[0]
      );
      createUserPayload['username'] = username;
      createUserPayload['awsUserId'] = [userInfo.awsUserId];
      result = await UserController.createUser(createUserPayload);
      // await subscribeUserToMailchimpAudience({
      //   name: createUserPayload.firstName + ' ' + createUserPayload.lastName,
      //   email: createUserPayload.email,
      // });
      // Add support user in the conversation
      await MessageController.addSupportMember(userInfo.awsUserId);
    }

    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * Get user
 */
export const getUser = async (req, res) => {
  if (!(req.params && req.params.id))
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

  const userId =
    req.params.id == 'me'
      ? req.requestContext.identity.cognitoIdentityId
      : req.params.id;
  try {
    const result = await UserController.getUser(urldecode(userId), {
      stripeAccountId: 0,
      stripeCustomerId: 0,
    });
    return successResponse(res, result);
  } catch (error) {
    if (req.params.id != 'me') {
      return failureResponse(res, error);
    }
  }
  console.log('User not found creating new user');
  try {
    await createUser(req, res);
    const result = await UserController.getUser(urldecode(userId), {
      stripeAccountId: 0,
    });
    return successResponse(res, result);
  } catch (err) {
    console.log(err);
    return failureResponse(res, err);
  }
};

const _check_username_exists = async (email, username) => {
  let userExists = await UserController.isExists({
    username: username,
    email: { $ne: email },
  });
  return userExists;
};

const _get_unique_username = async (email, username) => {
  const exists = await _check_username_exists(email, username);
  if (exists) {
    username = username + '_' + moment().format('X');
  }
  return username;
};

/**
 * Get user by username
 */
export const getUserByUsername = async (req, res) => {
  if (!(req.params && req.params.username))
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'username' };

  const username = req.params.username;
  try {
    const result = await UserController.get(
      {
        username: username,
      },
      { stripeCustomerId: 0, stripeAccountId: 0 }
    );
    return successResponse(res, result);
  } catch (error) {
    return failureResponse(res, error);
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const id =
      req.params.id === 'me'
        ? req.requestContext.identity.cognitoIdentityId
        : req.params.id;
    const data = req.body;
    const errors = updateUserValidation(data);
    if (errors != true) throw errors.shift();
    const result = await UserController.updateUser(urldecode(id), {
      ...data,
    });
    // Add support user in the conversation
    await MessageController.addSupportMember(urldecode(id));
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

// TODO: Handle user account close/disable flow
export const deleteUser = async (req, res) => {};

export const isUserExists = async (req, res) => {
  try {
    const data = req.body;
    if (!(data && data.username && data.email))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'username' };
    const exists = await _check_username_exists(
      data['email'],
      data['username']
    );
    return successResponse(res, exists);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const subscribeUser = async (req, res) => {
  try {
    const data = req.body;
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

    return successResponse(res, 'success');
  } catch (error) {
    return failureResponse(res, error);
  }
};

export const unsubscribeUser = async (req, res) => {
  try {
    const data = req.body;
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

    return successResponse(res, 'success');
  } catch (error) {
    return failureResponse(res, error);
  }
};
