/***
 * @name - HostRequest controller
 * @description - THis will handle business logic for hostRequest module
 */
import { UserModel, HostRequestModel } from '../../models';
import { dbConnect } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { ObjectID } from 'mongodb';

export class HostRequestController {
  static async list(filter, awsUserId) {
    await dbConnect();

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!(user && user.isAdmin)) {
      throw { ...ERROR_KEYS.UNAUTHORIZED };
    }

    const params = { filter: { isActive: true } };
    const hostRequests = await HostRequestModel.list(params);
    return { data: hostRequests, count: hostRequests.length };
  }

  static async createHostRequest(params) {
    await dbConnect();
    const hostRequests = await HostRequestModel.create(params);
    return hostRequests;
  }

  static async getHostRequest(hostId) {
    await dbConnect();
    const hostRequest = await HostRequestModel.getById(hostId);
    if (!hostRequest) throw { ...ERROR_KEYS.HOST_REQUEST_NOT_FOUND };
    return hostRequest;
  }

  static async updateHostRequest(hostId, data, awsUserId) {
    await dbConnect();

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!(user && user.isAdmin)) {
      throw { ...ERROR_KEYS.UNAUTHORIZED };
    }
    if (data['action'] !== 'pending') {
      throw ERROR_KEYS.INVALID_ACTION;
    }
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
  }

  static async deleteHostRequest(hostId, awsUserId) {
    await dbConnect();
    const hostRequest = await HostRequestModel.getById(hostId);
    if (!hostRequest) throw { ...ERROR_KEYS.HOST_REQUEST_NOT_FOUND };
    if (awsUserId !== hostRequest.memberId) {
      throw { ...ERROR_KEYS.UNAUTHORIZED };
    }
    await HostRequestModel.update(
      { _id: ObjectID(hostId), awsUserId: awsUserId },
      { isActive: false }
    );
    return 'success';
  }
}
