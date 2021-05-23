/***
 * @name - HostRequest controller
 * @description - THis will handle business logic for hostRequest module
 */
import { UserModel, ApprovalModel } from '../../models';
import { dbConnect } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import { MemberController } from '../members/member.ctrl';

export class ApprovalsController {
  static async list(filter, awsUserId) {
    await dbConnect();

    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!(user && user.isAdmin)) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }

    const params = [{ $match: { status: 'pending' } }];
    params.push({
      $project: {
        status: 1,
        message: 1,
        type: 1,
        createdAt: 1,
        updatedAt: 1,
        userId: { $toObjectId: '$userId' },
        tripId: { $toObjectId: '$tripId' },
        memberId: { $toObjectId: '$memberId' },
      },
    });
    params.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'requester',
      },
    });
    params.push({
      $unwind: {
        path: '$requester',
        preserveNullAndEmptyArrays: true,
      },
    });
    params.push({
      $lookup: {
        from: 'users',
        localField: 'memberId',
        foreignField: '_id',
        as: 'member',
      },
    });
    params.push({
      $unwind: {
        path: '$member',
        preserveNullAndEmptyArrays: true,
      },
    });
    params.push({
      $lookup: {
        from: 'trips',
        localField: 'tripId',
        foreignField: '_id',
        as: 'trip',
      },
    });
    params.push({
      $unwind: {
        path: '$trip',
        preserveNullAndEmptyArrays: true,
      },
    });
    params.push({
      $project: {
        status: 1,
        message: 1,
        type: 1,
        createdAt: 1,
        updatedAt: 1,
        userId: 1,
        tripId: 1,
        memberId: 1,
        'trip.title': 1,
        'member.firstName': 1,
        'member.lastName': 1,
        'member.avatarUrl': 1,
        'member.username': 1,
        'requester.firstName': 1,
        'requester.lastName': 1,
        'requester.avatarUrl': 1,
        'requester.username': 1,
      },
    });
    const approvals = await ApprovalModel.aggregate(params);
    return { data: approvals, count: approvals.length };
  }

  static async createApproval(params) {
    await dbConnect();
    return await ApprovalModel.create(params);
  }

  static async actionApproval(approvalId, params) {
    await dbConnect();
    const user = await UserModel.get({ awsUserId: params.awsUserId });
    if (!(user && user.isAdmin)) {
      throw ERROR_KEYS.UNAUTHORIZED;
    }
    if (!params.action) {
      throw ERROR_KEYS.BAD_REQUEST;
    }
    const approval = await ApprovalModel.getById(approvalId);
    if (!approval) throw { ...ERROR_KEYS.APPROVAL_NOT_FOUND };
    switch (params.action) {
      case 'approve':
        let updateStatus = false;
        switch (approval.type) {
          case 'MemberRemove':
            const queryParams = {
              awsUserId: params.awsUserId,
              memberIds: [approval.memberId],
              action: 'removeMember',
              tripId: approval.tripId,
            };
            await MemberController.memberAction(queryParams);
            updateStatus = true;
            break;
          case 'TripRemove':
            break;
          default:
        }
        if (updateStatus) {
          await ApprovalModel.update(
            { _id: Types.ObjectId(approvalId) },
            { status: 'approve' }
          );
        }
        break;
      case 'decline':
      case 'cancel':
        await ApprovalModel.update(
          { _id: Types.ObjectId(approvalId) },
          { status: 'decline' }
        );
        break;
      default:
        throw ERROR_KEYS.BAD_REQUEST;
    }

    return approval;
  }
}
