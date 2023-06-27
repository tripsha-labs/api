import { Types } from 'mongoose';
import {
  UserPermissionModel,
  UserModel,
  GroupPermissionModel,
  GroupUserModel,
  BookingModel,
  TripModel,
} from '../../models';
import { USER_BASIC_INFO } from '../../constants/constants';

const mergePermisions = (obj1 = {}, obj2 = {}) => {
  Object.keys(obj2).forEach(key => {
    if (obj1.hasOwnProperty(key) && obj1[key] != obj2[key]) {
      if (obj1[key] == 'edit' || obj2[key] == 'edit') obj1[key] = 'edit';
      else if (obj1[key] == 'view' || obj2[key] == 'view') obj1[key] = 'view';
    } else {
      obj1[key] = obj2[key];
    }
  });
  return obj1;
};
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
          pipeline: [
            {
              $project: USER_BASIC_INFO,
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'groupusers',
          as: 'groups',
          let: {
            email: '$email',
            tripId: Types.ObjectId(params.tripId),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$email', '$$email'] },
                    { $eq: ['$tripId', '$$tripId'] },
                  ],
                },
              },
            },
            { $project: { groupId: 1 } },
          ],
        },
      },
    ]);
  }
  static async generateInheritedPermissions(tripId) {
    let permissions = {};
    const trip = await TripModel.get({ _id: Types.ObjectId(tripId) });
    const userPermissions = await UserPermissionModel.find({
      tripId: Types.ObjectId(tripId),
    });
    userPermissions?.forEach(up => {
      permissions[up.email] = {
        permissions: [up?.directPermissions || {}],
        groupIds: [],
      };
    });
    const userGroups = await GroupUserModel.find({
      tripId: Types.ObjectId(tripId),
    });
    const members = userGroups?.filter(v => v.type == 'user');
    if (members?.length > 0) {
      members?.forEach(m => {
        if (!permissions.hasOwnProperty(m.email))
          permissions[m.email] = { groupIds: [], permissions: [] };
        permissions[m.email].groupIds.push(m.groupId);
      });
    }
    const views = userGroups?.filter(v => v.type == 'view');
    if (views?.length > 0) {
      const viewMembers = await BookingModel.aggregate([
        {
          $match: {
            tripId: Types.ObjectId(tripId),
            status: 'approved',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'memberId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: { email: 1 },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $replaceRoot: {
            newRoot: '$user',
          },
        },
      ]);

      views.forEach(v => {
        const emails = [];
        if (
          trip.hasOwnProperty('hiddenAttendees') &&
          trip?.hiddenAttendees?.hasOwnProperty(v.viewId) &&
          trip?.hiddenAttendees[v.viewId].length > 0
        ) {
          viewMembers.forEach(m => {
            if (!trip?.hiddenAttendees[v.viewId].includes(m._id))
              if (!permissions.hasOwnProperty(m.email))
                permissions[m.email] = { groupIds: [], permissions: [] };
            permissions[m.email].groupIds.push(v.groupId);
          });
        } else {
          viewMembers.forEach(m => {
            if (!permissions.hasOwnProperty(m.email))
              permissions[m.email] = { groupIds: [], permissions: [] };
            permissions[m.email].groupIds.push(v.groupId);
          });
        }
      });
    }
    const groupPermissions = await GroupPermissionModel.find({
      tripId: Types.ObjectId(tripId),
    });

    permissions = Object.keys(permissions).map(email => {
      const perms = permissions[email].permissions;
      const groupIds = permissions[email].groupIds?.map(id => id.toString());
      groupPermissions?.forEach(gp => {
        if (groupIds.includes(gp._id.toString())) {
          perms.push({
            tabPermissions: gp.tabPermissions,
            topicPermissions: gp.topicPermissions,
            viewPermissions: gp.viewPermissions,
          });
        }
      });
      return {
        email,
        groupIds: permissions[email].groupIds,
        permissions: perms,
      };
    });
    permissions?.map(p => {
      const perms = {
        tabPermissions: {},
        topicPermissions: {},
        viewPermissions: {},
      };
      p.permissions?.forEach(pr => {
        const { tabPermissions, topicPermissions, viewPermissions } = pr || {};
        perms.tabPermissions = mergePermisions(
          perms.tabPermissions,
          tabPermissions
        );
        perms.topicPermissions = mergePermisions(
          perms.topicPermissions,
          topicPermissions
        );
        perms.viewPermissions = mergePermisions(
          perms.viewPermissions,
          viewPermissions
        );
      });
      p['finalPermissions'] = perms;
      return p;
    });
    const createOrUpdatePermissions = permissions.map(async p => {
      return {
        updateOne: {
          filter: { email: p.email, tripId: Types.ObjectId(tripId) },
          update: {
            $set: {
              email: p.email,
              tripId: Types.ObjectId(tripId),
              ...p.finalPermissions,
            },
          },
          upsert: true,
        },
      };
    });

    const data = await Promise.all(createOrUpdatePermissions);
    await UserPermissionModel.bulkWrite(data);
  }
  static async generateInheritedPermissionsByUser(tripId, user) {
    const finalPermissions = {
      tabPermissions: {},
      topicPermissions: {},
      viewPermissions: {},
      coHost: false,
    };

    if (!user) return finalPermissions;
    const trip = await TripModel.get({ _id: Types.ObjectId(tripId) });
    const userPermissionPayload = {};
    const userPermission = await UserPermissionModel.findOne({
      tripId: Types.ObjectId(tripId),
      email: user.email,
    }).lean();
    finalPermissions.coHost = userPermission?.coHost || false;
    userPermissionPayload['permissions'] = [
      userPermission?.directPermissions || {},
    ];
    userPermissionPayload['groupIds'] = [];
    const userGroups = await GroupUserModel.find({
      tripId: Types.ObjectId(tripId),
    });

    const userSpecificGroups = userGroups?.filter(v => v.email == user.email);
    if (userSpecificGroups?.length > 0) {
      userSpecificGroups?.forEach(m => {
        userPermissionPayload['groupIds'].push(m.groupId.toString());
      });
    }
    const groupPermissions = await GroupPermissionModel.find({
      tripId: Types.ObjectId(tripId),
    });
    const viewBasedGroups = groupPermissions?.filter(v => v.type == 'view');
    if (viewBasedGroups?.length > 0) {
      const viewMembers = await BookingModel.aggregate([
        {
          $match: {
            tripId: Types.ObjectId(tripId),
            status: 'approved',
            memberId: user._id,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'memberId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: { email: 1 },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $replaceRoot: {
            newRoot: '$user',
          },
        },
      ]);

      viewBasedGroups.forEach(v => {
        if (
          trip.hasOwnProperty('hiddenAttendees') &&
          trip?.hiddenAttendees?.hasOwnProperty(v.viewId) &&
          trip?.hiddenAttendees[v.viewId].length > 0
        ) {
          viewMembers.forEach(m => {
            if (!trip?.hiddenAttendees[v.viewId].includes(m._id))
              userPermissionPayload['groupIds'].push(v._id.toString());
          });
        } else {
          viewMembers.forEach(m => {
            userPermissionPayload['groupIds'].push(v._id.toString());
          });
        }
      });
    }

    const permList = userPermissionPayload.permissions;
    const groupIds = userPermissionPayload['groupIds'];
    groupPermissions?.forEach(gp => {
      if (groupIds.includes(gp._id.toString())) {
        permList.push({
          tabPermissions: gp.tabPermissions,
          topicPermissions: gp.topicPermissions,
          viewPermissions: gp.viewPermissions,
        });
      }
    });
    permList?.forEach(pr => {
      const { tabPermissions, topicPermissions, viewPermissions } = pr || {};
      finalPermissions.tabPermissions = mergePermisions(
        finalPermissions.tabPermissions,
        tabPermissions
      );
      finalPermissions.topicPermissions = mergePermisions(
        finalPermissions.topicPermissions,
        topicPermissions
      );
      finalPermissions.viewPermissions = mergePermisions(
        finalPermissions.viewPermissions,
        viewPermissions
      );
    });
    return finalPermissions;
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
    if (body.hasOwnProperty('groupIds')) {
      await GroupUserModel.deleteMany({
        email: { $in: users.map(u => u.email) },
        tripId: tripId,
      });
      const groupUsersPayload = [];
      body.groupIds?.forEach(groupId => {
        users?.forEach(user => {
          groupUsersPayload.push({
            updateOne: {
              filter: {
                email: user.email,
                tripId: tripId,
                groupId: Types.ObjectId(groupId),
              },
              update: {
                $set: {
                  email: user.email,
                  groupId: Types.ObjectId(groupId),
                  type: 'user',
                  tripId: tripId,
                },
              },
              upsert: true,
            },
          });
        });
      });
      const dataGroupUser = await Promise.all(groupUsersPayload);
      await GroupUserModel.bulkWrite(dataGroupUser);
    }
    return 'success';
  }

  static async deleteUserPermissions(query) {
    const permissions = await UserPermissionModel.find(query);
    if (permissions?.length > 0) {
      await GroupUserModel.deleteMany({
        email: { $in: permissions.map(u => u.email) },
        tripId: permissions[0].tripId,
      });
    }
    return await UserPermissionModel.deleteMany(query);
  }

  static async listGroupPermissions(params) {
    return await GroupPermissionModel.aggregate([
      {
        $match: {
          tripId: Types.ObjectId(params.tripId),
        },
      },
      {
        $lookup: {
          from: 'groupusers',
          as: 'groups',
          let: {
            groupId: '$_id',
            tripId: Types.ObjectId(params.tripId),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$groupId', '$$groupId'] },
                    { $eq: ['$tripId', '$$tripId'] },
                  ],
                },
              },
            },
            { $project: { groupId: 1, type: 1, viewId: 1, email: 1 } },
          ],
        },
      },
    ]);
  }

  static async createGroupPermission(body) {
    const tripId = Types.ObjectId(body.tripId);
    await GroupPermissionModel.updateOne(
      { name: body.name, tripId: tripId },
      { $set: { ...body, tripId: tripId } },
      { upsert: true }
    );
    const groupPermission = await GroupPermissionModel.findOne({
      name: body.name,
      tripId: tripId,
    });
    const groupUsersPayload = [];
    if (body.hasOwnProperty('memberEmails')) {
      body.memberEmails?.forEach(email => {
        groupUsersPayload.push({
          updateOne: {
            filter: { email: email, groupId: groupPermission._id },
            update: {
              $set: {
                email: email,
                groupId: groupPermission._id,
                tripId: tripId,
                type: 'user',
              },
            },
            upsert: true,
          },
        });
      });
    }
    const data = await Promise.all(groupUsersPayload);
    await GroupUserModel.bulkWrite(data);
    return 'success';
  }

  static async deleteGroupPermissions(query) {
    const groups = await GroupPermissionModel.find(query);
    if (groups?.length > 0) {
      await GroupUserModel.deleteMany({
        groupId: { $in: groups.map(u => u._id) },
        tripId: groups[0].tripId,
      });
    }
    return await GroupPermissionModel.deleteMany(query);
  }
}
