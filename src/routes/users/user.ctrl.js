import {
  UserModel,
  createUserValidation,
  createUserDefaultValues,
  updateUserDefaultValues,
  updateUserValidation,
} from '../../models';

export class UserController {
  static async createUser(user) {
    const error = createUserValidation(user);
    if (error != true) return { error };
    const userObject = {
      ...user,
      ...createUserDefaultValues,
    };

    try {
      const userModel = new UserModel();
      const res = await userModel.add(userObject);
      return { error: null, result: res.Item };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  static async updateUser(id, user) {
    const error = updateUserValidation(user);
    if (error != true) return { error };
    const userModel = new UserModel();
    if (user && user.userId) {
      try {
        const resIsExists = await userModel.isExists(user.userId);
        if (resIsExists && resIsExists.Items && resIsExists.Items.length > 0) {
          if (resIsExists.Items[0].id !== id) {
            return { error: 'UserAlreadyExists' };
          }
        }
      } catch (error) {
        console.log(error);
        return { error };
      }
    }
    const userObject = {
      ...user,
      ...updateUserDefaultValues,
    };

    try {
      const res = await userModel.update(id, userObject);
      return { error: null, result: res };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  static async getUser(id) {
    try {
      const userModel = new UserModel();
      const res = await userModel.get(id);
      if (!(res && res.Item)) throw 'User not found';
      return { error: null, result: res.Item };
    } catch (error) {
      console.log(error);
      return { error: 'User not found' };
    }
  }

  static async listUser(user) {
    try {
      const userModel = new UserModel();
      const res = await userModel.list(user);
      console.log(res);
      const lastEvaluatedKey =
        res && res.LastEvaluatedKey
          ? {
              nextPageToken: Buffer.from(
                JSON.stringify(res.LastEvaluatedKey)
              ).toString('base64'),
            }
          : {};
      const result = {
        data: res.Items,
        count: res.Count,
        ...lastEvaluatedKey,
      };
      return { error: null, result };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  static async deleteUser(id) {
    try {
      const userModel = new UserModel();
      await userModel.delete(id);
      return { error: null, result: 'success' };
    } catch (error) {
      console.log(error);
      return { error: 'Failed to delete' };
    }
  }

  static async isExists(username) {
    try {
      const userModel = new UserModel();
      const res = await userModel.isExists(username);
      return {
        error: null,
        result: res && res.Items && res.Items.length > 0 ? true : false,
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}