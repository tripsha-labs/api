import {
  OrganizationModel,
  OrganizationPermissionModel,
  TripModel,
} from '../../models';
export class OrganizationController {
  static async listOrganizations(user) {
    return await OrganizationPermissionModel.aggregate([
      {
        $match: {
          userId: user._id,
        },
      },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      {
        $unwind: {
          path: '$organization',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$organization', '$$ROOT'],
          },
        },
      },
    ]);
  }
  static async getOrganization(query) {
    return await OrganizationModel.findOne(query);
  }
  static async createOrganization(body, user) {
    const organization = await OrganizationModel.create(body);
    const permissionPayload = {
      organizationId: organization._id,
      userId: user._id,
      permissions: ['owner'],
    };
    await OrganizationPermissionModel.updateOne(
      {
        organizationId: organization._id,
        userId: user._id,
      },
      permissionPayload,
      { upsert: true }
    );
    return organization;
  }
  static async deleteOrganization(query) {
    return await OrganizationModel.updateOne(query);
  }
  static async updateOrganization(query, update) {
    return await OrganizationModel.updateOne(query, update);
  }
  static async listOrganizationPermissions(query) {
    return await OrganizationPermissionModel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                email: 1,
                firstName: 1,
                lastName: 1,
                username: 1,
                avatarUrl: 1,
              },
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
    ]);
  }
  static async createUpdateOrganizationPermission(payload) {
    return await OrganizationPermissionModel.bulkWrite(payload);
  }
  static async deleteOrganizationPermissions(query) {
    return await OrganizationPermissionModel.deleteMany(query);
  }
}
