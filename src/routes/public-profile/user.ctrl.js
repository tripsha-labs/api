/***
 * @name - User controller
 * @description - THis will handle business logic for user module
 */
import { Types } from 'mongoose';
import { UserModel } from '../../models';
import {
  prepareCommonFilter,
  prepareCommonPagination,
  prepareSortFilter,
} from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class UserController {
  static async inviteUser(user) {
    try {
      const checkUser = await UserModel.get({ email: user.email });
      if (checkUser) {
        await UserModel.update({ email: user.email }, { isHost: user.isHost });
      } else {
        await UserModel.create(user);
      }
      return 'success';
    } catch (error) {
      throw error;
    }
  }

  static async createUser(user = {}) {
    try {
      const result = await UserModel.create(user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserByEmail(email, user) {
    try {
      await UserModel.update({ email: email }, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateUserAdmin(id, user) {
    try {
      await UserModel.update({ _id: Types.ObjectId(id) }, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async updateUser(id, user) {
    try {
      if (user && user.username) {
        const res = await UserModel.count({
          _id: { $nin: [id] },
          username: user.username,
        });
        if (res && res > 0) {
          throw ERROR_KEYS.USER_ALREADY_EXISTS;
        }
      }
      await UserModel.update({ _id: id }, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async getUser(id, select = {}) {
    try {
      const user = await UserModel.get({ _id: id }, select);
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async listUserv2(filter) {
    try {
      const queryFilter = {
        $or: [
          {
            username: {
              $regex: new RegExp('^' + (filter.search || ''), 'i'),
            },
          },
          {
            firstName: {
              $regex: new RegExp('^' + (filter.search || ''), 'i'),
            },
          },
          {
            lastName: {
              $regex: new RegExp('^' + (filter.search || ''), 'i'),
            },
          },
          {
            email: {
              $regex: new RegExp('^' + (filter.search || ''), 'i'),
            },
          },
        ],
      };

      // types
      if (filter.userType) {
        switch (filter.userType) {
          case 'host':
            queryFilter['isHost'] = true;
            break;
          case 'admin':
            queryFilter['isAdmin'] = true;
            break;
          default:
        }
      }
      // statuses
      if (filter.userStatus) {
        switch (filter.userStatus) {
          case 'active':
            queryFilter['isBlocked'] = false;
            queryFilter['isActive'] = true;
            break;
          case 'deleted':
            queryFilter['isActive'] = false;
            break;
          case 'blocked':
            queryFilter['isBlocked'] = true;
            break;
          default:
        }
      }
      const query = [
        { $match: queryFilter },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: { $toLower: '$email' },
            createdAt: 1,
            avatarUrl: 1,
            username: { $toLower: '$username' },
            isHost: 1,
            hostShare: 1,
            isAdmin: 1,
            isActive: 1,
            isBlocked: 1,
            additionalEmails: 1,
            isConcierge: 1,
            name: {
              $concat: [
                { $toLower: '$firstName' },
                ' ',
                { $toLower: '$lastName' },
              ],
            },
          },
        },
        {
          $sort: prepareSortFilter(filter, [
            'name',
            'username',
            'email',
            'createdAt',
          ]),
        },
        ...prepareCommonPagination(filter),
      ];

      const userCount = await UserModel.count(queryFilter);
      const users = await UserModel.aggregate(query);
      return { data: users, count: userCount };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async listUser(filter) {
    try {
      const params = {
        filter: {
          $or: [
            {
              username: {
                $regex: new RegExp('^' + (filter.search || ''), 'i'),
              },
            },
            {
              firstName: {
                $regex: new RegExp('^' + (filter.search || ''), 'i'),
              },
            },
            {
              lastName: {
                $regex: new RegExp('^' + (filter.search || ''), 'i'),
              },
            },
            {
              email: {
                $regex: new RegExp('^' + (filter.search || ''), 'i'),
              },
            },
          ],
        },
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
          createdAt: 1,
          avatarUrl: 1,
          username: 1,
          isHost: 1,
          hostShare: 1,
          isAdmin: 1,
          isActive: 1,
          isBlocked: 1,
          additionalEmails: 1,
          isConcierge: 1,
        },
        ...prepareCommonFilter(filter, ['username', 'email', 'createdAt']),
      };

      // types
      if (filter.userType) {
        switch (filter.userType) {
          case 'host':
            params.filter['isHost'] = true;
            break;
          case 'admin':
            params.filter['isAdmin'] = true;
            break;
          default:
        }
      }
      // statuses
      if (filter.userStatus) {
        switch (filter.userStatus) {
          case 'active':
            params.filter['isBlocked'] = false;
            params.filter['isActive'] = true;
            break;
          case 'deleted':
            params.filter['isActive'] = false;
            break;
          case 'blocked':
            params.filter['isBlocked'] = true;
            break;
          default:
        }
      }
      const userCount = await UserModel.count(params.filter);
      const users = await UserModel.list(params);
      return { data: users, count: userCount };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      if (!id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
      await UserModel.delete(id);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async isExists(params) {
    try {
      const res = await UserModel.count(params);
      return res && res > 0 ? true : false;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async get(params, select = {}) {
    try {
      const user = await UserModel.get(params, select);
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getCurrentUser(prams) {
    return UserController.get(prams);
  }
}
