import { OrganizationController } from './organizations.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import {
  UserModel,
  adminUpdateOrganizationsValidation,
  createOrganizationsValidation,
  updateOrganizationsValidation,
} from '../../models';
import { TripController } from '../trips/trip.ctrl';
/**
 * List organizations methods
 */
export const listOrganizations = async (req, res) => {
  try {
    const organizations = await OrganizationController.listOrganizations(
      req.currentUser
    );
    return successResponse(res, organizations);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create organization methods
 */
export const createOrganization = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = createOrganizationsValidation(body);
    if (validation != true) throw validation.shift();
    body['updatedBy'] = req.currentUser._id;
    body['createdBy'] = req.currentUser._id;
    body['ownerId'] = req.currentUser._id;
    const organization = await OrganizationController.createOrganization(
      body,
      req.currentUser
    );
    return successResponse(res, organization);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Get organization methods
 */
export const getOrganization = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const organization = await OrganizationController.getOrganization({
      _id: Types.ObjectId(req.params?.id),
      isActive: true,
    });
    return successResponse(res, organization);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * Update organization methods
 */
export const updateOrganization = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    const validation = updateOrganizationsValidation(body);
    if (validation != true) throw validation.shift();
    body['updatedBy'] = req.currentUser._id;
    await OrganizationController.updateOrganization(
      {
        _id: Types.ObjectId(req.params.id),
      },
      body
    );
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete organization methods
 */
export const deleteOrganization = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    await OrganizationController.updateOrganization(
      {
        _id: Types.ObjectId(req.params.id),
      },
      { isActive: false }
    );
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
export const listProjects = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const params = req.query ? req.query : {};
    const result = await TripController.activeTrips(
      params,
      req.currentUser,
      req.params?.id
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * List organization permissions methods
 */
export const listOrganizationPermissions = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const organizations = await OrganizationController.listOrganizationPermissions(
      { organizationId: Types.ObjectId(req.params.id) }
    );
    return successResponse(res, organizations);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create/Update organization permission methods
 */
export const createUpdateOrganizationPermission = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    if (!body?.emails)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'emails',
      };
    const emails = body?.emails || [];
    const userIds = [];
    let newUsers = [];
    if (emails && emails.length > 0) {
      const users = await UserModel.list({
        filter: { email: { $in: emails } },
        select: { email: 1 },
      });
      const foundUsers = [];
      users?.forEach(user => {
        userIds.push(user._id);
        foundUsers.push(user.email);
      });
      newUsers = emails?.filter(email => !foundUsers?.includes(email));
    }

    if (newUsers?.length > 0) {
      const insertPayload = newUsers?.map(email => {
        return {
          updateOne: {
            filter: {
              email: email,
            },
            update: {
              $set: {
                email: email,
                isActive: true,
                isHostView: false,
              },
            },
            upsert: true,
          },
        };
      });
      await UserModel.bulkWrite(insertPayload);
      const userList = await UserModel.list({
        filter: { email: { $in: emails } },
        select: { email: 1 },
      });
      userList?.forEach(user => {
        userIds.push(user._id);
      });
    }
    const payload = userIds?.map(userId => {
      return {
        updateOne: {
          filter: {
            userId: userId,
            organizationId: Types.ObjectId(req.params.id),
          },
          update: {
            $set: {
              userId: userId,
              organizationId: Types.ObjectId(req.params.id),
              permissions: body?.permissions,
            },
          },
          upsert: true,
        },
      };
    });

    await OrganizationController.createUpdateOrganizationPermission(payload);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete organization permissions methods
 */
export const deleteOrganizationPermissions = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    if (!body?.user_ids)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'user_ids',
      };
    const user_ids = body?.user_ids?.map(id => Types.ObjectId(id));
    await OrganizationController.deleteOrganizationPermissions({
      userId: { $in: user_ids },
      organizationId: Types.ObjectId(req.params.id),
    });
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update organization methods
 */
export const updateOrganizationAdmin = async (req, res) => {
  try {
    if (!req?.currentUser?.isAdmin) throw ERROR_KEYS.UNAUTHORIZED;
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    const validation = adminUpdateOrganizationsValidation(body);
    if (validation != true) throw validation.shift();
    body['updatedBy'] = req.currentUser._id;
    await OrganizationController.updateOrganization(
      {
        _id: Types.ObjectId(req.params.id),
      },
      body
    );
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * List admin organizations methods
 */
export const listAdminOrganizations = async (req, res) => {
  try {
    if (!req?.currentUser?.isAdmin) throw ERROR_KEYS.UNAUTHORIZED;
    const organizations = await OrganizationController.listOrganizations(
      req.currentUser,
      true
    );
    return successResponse(res, organizations);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
