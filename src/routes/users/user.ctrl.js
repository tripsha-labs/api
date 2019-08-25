import {
  UserModel,
  createUserValidation,
  updateUserValidation,
} from '../../models';
import { dbConnect } from '../../utils/db-connect';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class UserController {
  static async createUser(user = {}) {
    try {
      // Validate user fields against the strict schema
      const error = createUserValidation(user);
      if (error != true) return { error };
      await dbConnect();
      const result = await UserModel.create(user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id, user) {
    try {
      if (!id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
      const errors = updateUserValidation(user);
      if (errors != true) throw errors.shift();
      await dbConnect();
      await UserModel.update(id, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getUser(id) {
    try {
      if (!id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
      await dbConnect();
      const user = await UserModel.getById(id);
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
}
