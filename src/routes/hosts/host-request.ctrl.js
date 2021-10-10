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

    const params = [{ $match: { isActive: true, status: 'pending' } }];
    params.push({
      $lookup: {
        from: 'users',
        localField: 'awsUserId',
        foreignField: 'awsUserId',
        as: 'ownerDetails',
      },
    });
    params.push({
      $unwind: {
        path: '$ownerDetails',
        preserveNullAndEmptyArrays: true,
      },
    });
    const hostRequests = await HostRequestModel.aggregate(params);
    return { data: hostRequests, count: hostRequests.length };
  }

  static async createHostRequest(params) {
    await dbConnect();
    const hostRequest = await HostRequestModel.get({
      awsUserId: params.awsUserId,
    });
    if (hostRequest && hostRequest.status == 'pending') {
      throw { ...ERROR_KEYS.HOST_REQUEST_ALREADY_EXISTS };
    }
    const hostRequests = await HostRequestModel.create(params);
    await UserModel.update(
      { awsUserId: params.awsUserId },
      { hostRequestSent: true }
    );
    return hostRequests;
  }

  static async getHostRequest(hostId) {
    await dbConnect();
    const hostRequest = await HostRequestModel.getById(hostId);
    if (!hostRequest) throw { ...ERROR_KEYS.HOST_REQUEST_NOT_FOUND };
    const ownerDetails = await UserModel.get({
      awsUserId: hostRequest.awsUserId,
    });
    hostRequest['ownerDetails'] = ownerDetails;
    return hostRequest;
  }

  static async updateHostRequest(hostId, data, awsUserId) {
    await dbConnect();

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!(user && user.isAdmin)) {
      throw { ...ERROR_KEYS.UNAUTHORIZED };
    }
    const hostRequest = await HostRequestModel.getById(hostId);
    if (hostRequest && hostRequest['status'] !== 'pending') {
      throw ERROR_KEYS.INVALID_ACTION;
    }
    await HostRequestModel.update(
      { _id: ObjectID(hostId) },
      { status: data['action'] }
    );
    if (data['action'] == 'approved') {
      await UserModel.update(
        { awsUserId: hostRequest.awsUserId },
        { isIdentityVerified: true, isHostFirstLogin: true }
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
