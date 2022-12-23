/**
 * @name - Member directory Controller
 * @description - This will handle all business logic for Member directory
 */
import { Types } from 'mongoose';
import { MemberDirectoryModel, UserModel } from '../../models';

export class MemberDirectoryController {
  static async listMembers(filter) {
    const params = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'tripshaId',
          foreignField: '_id',
          as: 'user',
        },
      },
      // {
      //   $replaceRoot: {
      //     newRoot: {
      //       $mergeObjects: [{ $arrayElemAt: ['$user', 0] }, '$$ROOT'],
      //     },
      //   },
      // },
      {
        $project: {
          email: 1,
          firstName: 1,
          lastName: 1,
          company: 1,
          team: 1,
          livesIn: 1,
          avatarUrl: 1,
          name: 1,
          passportCountry: 1,
          visaStatus: 1,
          dietaryRequirements: 1,
          emergencyContact: 1,
          mobilityRestrictions: 1,
          user: 1,
        },
      },
    ];

    const members = await MemberDirectoryModel.aggregate(params);
    return { data: members, count: members.length };
  }
  static async createMembers(records, user) {
    const memberEmails = records.map(member => member.email);
    const users = await UserModel.list({
      filter: { email: { $in: memberEmails } },
      select: { email: 1, _id: 1 },
    });
    const userMap = {};
    users?.forEach(u => {
      userMap[u.email] = u._id;
    });
    const promises = records.map(async record => {
      return new Promise(resolve => {
        if (userMap.hasOwnProperty(record.email)) {
          record.tripshaId = userMap[record.email];
        }
        record.hostId = user._id.toString();
        return resolve({
          updateOne: {
            filter: { email: record.email, hostId: user._id.toString() },
            update: record,
            upsert: true,
          },
        });
      });
    });
    const result = await Promise.all(promises);
    await MemberDirectoryModel.bulkWrite(result);
    return 'success';
  }
  static async deleteMembers(ids) {
    const memberIds = ids.map(id => Types.ObjectId(id));
    await MemberDirectoryModel.deleteMany({ _id: { $in: memberIds } });
    return 'success';
  }
}
