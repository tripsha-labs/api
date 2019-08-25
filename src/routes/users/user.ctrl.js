import { UserModel } from '../../models';
import { dbConnect } from '../../utils/db-connect';
import { prepareCommonFilter } from '../../helpers';

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

  static async updateUser(id, user) {
    try {
      await dbConnect();
      return await UserModel.update(id, user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getUser(id) {
    try {
      await dbConnect();
      const user = await UserModel.getById(id);
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
          email: {
            $regex: new RegExp('^' + (filter.search || ''), 'i'),
          },
        },
        ...prepareCommonFilter(filter, ['email']),
      };
      await dbConnect();
      const users = await UserModel.list(params);
      return users;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
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
}
