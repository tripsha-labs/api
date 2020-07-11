/***
 * @name - HostRequest controller
 * @description - THis will handle business logic for hostRequest module
 */
import { UserModel, HostRequestModel } from '../../models';
import { dbConnect } from '../../utils';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';
import { ObjectID } from 'mongodb';

export class HostRequestController {
  static async list(filter, awsUserId) {
    try {
      const user = await UserModel.get({ awsUserId: awsUserId });
      if (!(user && user.isAdmin)) {
        throw { ...ERROR_KEYS.UNAUTHORIZED };
      }
    } catch (error) {
      throw { ...ERROR_KEYS.USER_NOT_FOUND };
    }
    try {
      const params = { filter: { isActive: true } };
      await dbConnect();
      const hostRequests = await HostRequestModel.list(params);
      return { data: hostRequests, count: hostRequests.length };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async createHostRequest(params) {
    try {
      await dbConnect();
      const hostRequests = await HostRequestModel.create(params);
      return hostRequests;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getHostRequest(hostId) {
    try {
      await dbConnect();
      const hostRequests = await HostRequestModel.getById(hostId);
      return hostRequests;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async updateHostRequest(hostId, data, awsUserId) {
    try {
      const user = await UserModel.get({ awsUserId: awsUserId });
      if (!(user && user.isAdmin)) {
        throw { ...ERROR_KEYS.UNAUTHORIZED };
      }
    } catch (error) {
      throw { ...ERROR_KEYS.USER_NOT_FOUND };
    }
    try {
      await dbConnect();
      await HostRequestModel.update(
        { _id: ObjectID(hostId) },
        { status: data['action'] }
      );
      if (data['action'] == 'approved') {
        await UserModel.update(
          { awsUserId: awsUserId },
          { isIdentityVerified: true }
        );
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteHostRequest(hostId, awsUserId) {
    try {
      await dbConnect();
      await HostRequestModel.update(
        { _id: ObjectID(hostId), awsUserId: awsUserId },
        { isActive: false }
      );
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
