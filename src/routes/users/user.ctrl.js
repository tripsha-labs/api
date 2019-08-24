import {
  UserModel,
  createUserValidation,
  createUserDefaultValues,
  updateUserDefaultValues,
  updateUserValidation,
} from '../../models';
import { ERROR_KEYS } from '../../constants';
import { base64Encode } from '../../helpers';

export class UserController {
  static async createUser(user = {}) {
    try {
      const error = createUserValidation(user);
      if (error != true) return error.shift();
      const userObject = {
        ...user,
        ...createUserDefaultValues,
      };

      const res = await new UserModel().add(userObject);
      return res.Item;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateUser(id, user) {
    try {
      const error = updateUserValidation(user);
      if (error != true) throw error.shift();
      const userModel = new UserModel();
      if (user && user.userId) {
        const resIsExists = await userModel.isExists(user.userId, id);
        if (resIsExists && resIsExists.Items && resIsExists.Items.length > 0) {
          if (resIsExists.Items[0].id !== id) {
            throw ERROR_KEYS.USER_ALREADY_EXISTS;
          }
        }
      }
      const userObject = {
        ...user,
        ...updateUserDefaultValues,
      };
      console.log(userObject);
      return await userModel.update(id, userObject);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getUser(id) {
    try {
      const res = await new UserModel().get(id);
      if (!(res && res.Item)) throw ERROR_KEYS.USER_NOT_FOUND;
      return res.Item;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async listUser(user) {
    try {
      const res = await new UserModel().list(user);

      const result = {
        data: res.Items,
        count: res.Count,
        ...base64Encode(res.LastEvaluatedKey),
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      await new UserModel().delete(id);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async isExists(username, userId) {
    try {
      const res = await new UserModel().isExists(username, userId);
      return res && res.Items && res.Items.length > 0 ? true : false;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
