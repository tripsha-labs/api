/***
 * @name - User controller
 * @description - THis will handle business logic for user module
 */
import { UserModel } from '../../models';
import { dbConnect, dbClose } from '../../utils/db-connect';
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
    } finally {
      dbClose();
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
    } finally {
      dbClose();
    }
  }

  static async getUser(id) {
    try {
      await dbConnect();
      const user = await UserModel.get({ awsUserId: id });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async listUser(filter) {
    try {
      const params = {
        filter: {
          username: {
            $regex: new RegExp('^' + (filter.search || ''), 'i'),
          },
        },
        ...prepareCommonFilter(filter, ['username']),
      };
      await dbConnect();
      const users = await UserModel.list(params);
      return { data: users, count: users.length };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
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
    } finally {
      dbClose();
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
    } finally {
      dbClose();
    }
  }
}
