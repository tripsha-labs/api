/***
 * @name - User controller
 * @description - THis will handle business logic for user module
 */
import { Types } from 'mongoose';
import { UserModel } from '../../models';
import { dbConnect, sendEmail } from '../../utils';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class UserController {
  static async inviteUser(user) {
    try {
      await dbConnect();
      const checkUser = await UserModel.get({ email: user.email });
      if (checkUser) {
        await UserModel.update({ email: user.email }, { isHost: user.isHost });
      } else {
        await UserModel.create(user);
      }
      // try {
      //   await sendEmail({
      //     emails: [user.email],
      //     name: 'Tripsher',
      //     subject: `Greetings!!!`,
      //     message: `You are invited to join Tripsha.`,
      //   });
      //   console.log('Email sent');
      // } catch (err) {
      //   console.log(err);
      // }
      return 'success';
    } catch (error) {
      throw error;
    }
  }

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

  static async updateUserAdmin(id, user) {
    try {
      await dbConnect();
      await UserModel.update({ _id: Types.ObjectId(id) }, user);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async updateUser(id, user) {
    try {
      await dbConnect();
      if (user && user.username) {
        const res = await UserModel.count({
          awsUserId: { $nin: [id] },
          username: user.username,
        });
        if (res && res > 0) {
          throw ERROR_KEYS.USER_ALREADY_EXISTS;
        }
      }
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
