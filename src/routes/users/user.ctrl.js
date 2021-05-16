/***
 * @name - User controller
 * @description - THis will handle business logic for user module
 */
import { UserModel } from '../../models';
import { dbConnect } from '../../utils';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class UserController {
  static async createUser(user = {}) {
    try {
      await dbConnect();
      const result = await UserModel.create(user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserByEmail(email, user) {
    try {
      await dbConnect();
      await UserModel.update({ email: email }, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateUser(id, user) {
    try {
      await dbConnect();
      await UserModel.update({ awsUserId: id }, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getUser(id, select = {}) {
    try {
      await dbConnect();
      const user = await UserModel.get({ awsUserId: { $in: [id] } }, select);
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      return user;
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
        select: { stripeCustomerId: 0, stripeAccountId: 0 },
        ...prepareCommonFilter(filter, ['username', 'email', 'createdAt']),
      };

      if (filter.isHost) {
        params.filter['isHost'] = true;
      }
      if (filter.showDeleted) {
        params.filter['isActive'] = false;
      }
      if (filter.isBlocked) {
        params.filter['isBlocked'] = true;
      }
      await dbConnect();
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
      await dbConnect();
      await UserModel.delete(id);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async isExists(params) {
    try {
      await dbConnect();
      const res = await UserModel.count(params);
      return res && res > 0 ? true : false;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async get(params, select = {}) {
    try {
      await dbConnect();
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
