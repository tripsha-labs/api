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
  StripeAPI,
} from '../../utils';
import { ERROR_KEYS, APP_CONSTANTS } from '../../constants';
import {
  createCognitoUser,
  setUserPassword,
  enableUser,
  disableUser,
  setUserEmail,
} from '../../utils';
import { updateUserValidation, adminUpdateUserValidation } from '../../models';
import { TripController } from '../trips/trip.ctrl';

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
      params['username'] =
        params['username'].toLowerCase() || params['email'].split('@')[0];
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
        notifyUser: params.notifyUser || false,
      };
      const user_result = await createCognitoUser(req, createUserInfo);
      if (user_result) {
        delete params['password'];
        await UserController.inviteUser(params);
        try {
          const user = await UserController.get({ email: params.email });
          let awsUserId = user.awsUserId;
          if (typeof user.awsUserId == 'array') {
            awsUserId = user.awsUserId[0];
          }
          await MessageController.addSupportMember(awsUserId);
        } catch (err) {
          console.log(err);
        }

        return successResponse(res, 'success');
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
    const currentUser = req?.currentUser || {};
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
      console.log('=========check email');
      if (params.email && user.email !== params.email) {
        const exists = await _check_email_exists(params.email);
        if (exists) throw ERROR_KEYS.EMAIL_ALREADY_EXISTS;
        await setUserEmail(
          req,
          user.email.toLowerCase(),
          params.email.toLowerCase()
        );
      }
      console.log('=========set password');
      if (params['password'] && params['password'] != '') {
        await setUserPassword(req, {
          password: params['password'],
          email: user.email.toLowerCase(),
        });
        delete params['password'];
      }
      console.log('=========update user');
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
      const users = await UserController.listUserv2(params);
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
export const createUser = async (req, res, skipResponse = false) => {
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
          notifyUser: true,
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
      if (userInfo['custom:username']) {
        const exists = await _check_username_exists(
          userInfo['email'],
          userInfo['custom:username']
        );
        if (exists) throw ERROR_KEYS.USERNAME_ALREADY_EXISTS;
      }
      if (userInfo.email_verified)
        createUserPayload['isEmailVerified'] = userInfo.email_verified;
      if (userInfo['custom:firstName'])
        createUserPayload['firstName'] = userInfo['custom:firstName'];
      if (userInfo['custom:lastName'])
        createUserPayload['lastName'] = userInfo['custom:lastName'];
      if (userInfo['custom:username'])
        createUserPayload['username'] = userInfo['custom:username'];
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
        createUserPayload['username'] ||
          createUserPayload['email'].split('@')[0]
      );
      createUserPayload['username'] = username;
      createUserPayload['awsUserId'] = [userInfo.awsUserId];
      result = await UserController.createUser(createUserPayload);

      // Add support user in the conversation
      await MessageController.addSupportMember(userInfo.awsUserId);
    }
    if (!skipResponse) return successResponse(res, result);
  } catch (error) {
    console.log(error);
    if (!skipResponse) return failureResponse(res, error);
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
    const select = {
      stripeAccountId: 0,
    };
    if (req.params.id !== 'me') {
      select['stripeCustomerId'] = 0;
    }
    const result = await UserController.getUser(urldecode(userId), select);
    const forceCheck = req.query?.force || false;
    if (forceCheck) {
      const userInfo = await getCurrentUser(req);
      if (!userInfo) throw 'Create User failed';
      userInfo['email'] = userInfo['email'].toLowerCase();
      if (userInfo['email'] != result.email) {
        await UserController.updateUser(urldecode(userId), {
          email: userInfo['email'],
          awsUserId: [urldecode(userId)],
        });
        result['email'] = userInfo['email'];
        result['awsUserId'] = [urldecode(userId)];
      }
    }
    return successResponse(res, result);
  } catch (error) {
    if (req.params.id != 'me') {
      return failureResponse(res, error);
    }
  }
  console.log('User not found creating new user');
  try {
    await createUser(req, res, true);
    const result = await UserController.getUser(urldecode(userId), {
      stripeAccountId: 0,
      visaStatus: 0,
      dietaryRequirements: 0,
      emergencyContact: 0,
      mobilityRestrictions: 0,
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

const _check_email_exists = async email => {
  return await UserController.isExists({
    email: email,
  });
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
 * Get user by username
 */
export const getUserByEmailORUsername = async (req, res) => {
  if (!req?.query?.email) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };

  const username = req?.query?.email;
  try {
    const result = await UserController.get(
      {
        $or: [{ username: username }, { email: username }],
      },
      {
        stripeCustomerId: 0,
        stripeAccountId: 0,
        visaStatus: 0,
        dietaryRequirements: 0,
        emergencyContact: 0,
        mobilityRestrictions: 0,
      }
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
    const currentUser = req.currentUser;
    const id =
      req.params.id == 'me' ? currentUser._id : Types.ObjectId(req.params.id);
    if (
      !(currentUser?._id?.toString() == id.toString() || currentUser.isAdmin)
    ) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    const data = req.body;
    const errors = updateUserValidation(data);
    if (errors != true) throw errors.shift();
    const result = await UserController.updateUser(id, {
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

export const isEmailExists = async (req, res) => {
  try {
    const data = req.body;
    if (!(data && data.email))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };
    const exists = await _check_email_exists(data['email']);
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

export const adminUserAction = async (req, res) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    const params = req.body || {};
    if (!params.email || !params.action) {
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email or action' };
    }
    if (currentUser && currentUser.isAdmin) {
      switch (params.action) {
        case 'enable':
          // await enableUser(req, params);
          await UserController.updateUserByEmail(params.email, {
            isBlocked: false,
          });
          break;
        case 'disable':
          // await disableUser(req, params);
          await UserController.updateUserByEmail(params.email, {
            isBlocked: true,
          });
          break;
        default:
          console.log('invalid action');
      }
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
 * List all trips
 */

export const adminTrips = async (req, res) => {
  try {
    const currentUser = await UserController.getCurrentUser({
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    if (currentUser?.isAdmin) {
      const params = req.query ? req.query : {};
      const result = await TripController.listAdminTrips(params);
      return successResponse(res, result);
    } else {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
