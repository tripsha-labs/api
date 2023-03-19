import { Types } from 'mongoose';
import { UserPermissionModel, UserModel } from '../../models';

export class PermissionsController {
  static async listUserPermissions(params) {
    return await UserPermissionModel.aggregate([
      {
        $match: {
          tripId: Types.ObjectId(params.tripId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'email',
          foreignField: 'email',
          as: 'userInfo',
        },
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  static async createUserPermission(body) {
    const tripId = Types.ObjectId(body.tripId);
    const emails = body.emails;
    const users = await UserModel.list({
      filter: { email: { $in: emails } },
      select: { email: 1 },
    });
    if (emails.length - users.length > 0) {
      const foundEmails = users.map(u => u.email);
      const difference = emails.filter(x => !foundEmails.includes(x));
      difference.map(email => {
        users.push({ email: email });
      });
    }
    delete body.emails;
    const createOrUpdatePermissions = users.map(async user => {
      return {
        updateOne: {
          filter: { email: user.email, tripId: tripId },
          update: {
            $set: {
              ...body,
              email: user.email,
              userId: user._id,
              tripId: tripId,
            },
          },
          upsert: true,
        },
      };
    });
    const data = await Promise.all(createOrUpdatePermissions);
    await UserPermissionModel.bulkWrite(data);
    return 'success';
  }

  static async deleteUserPermissions(query) {
    return await UserPermissionModel.deleteMany(query);
  }
}
