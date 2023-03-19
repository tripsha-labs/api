import { PermissionsController } from './permissions.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import {
  createUserPermissionValidation,
  updateUserPermissionValidation,
} from '../../models';
/**
 * List User permissions methods
 */
export const listUserPermissions = async (req, res) => {
  try {
    const params = req.query || {};
    if (!params?.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const permissions = await PermissionsController.listUserPermissions(params);
    return successResponse(res, permissions);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create user permissions methods
 */
export const createUserPermissions = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = createUserPermissionValidation(body);
    if (validation != true) throw validation.shift();
    body['updatedBy'] = req.currentUser._id;
    body['createdBy'] = req.currentUser._id;
    await PermissionsController.createUserPermission(body);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete user permissions methods
 */
export const deleteUserPermissions = async (req, res) => {
  const body = req.body || {};
  if (Array.isArray(body?.permission_ids) && body?.permission_ids?.length == 0)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'permission_ids' };
  try {
    const permissionIds = body?.permission_ids.map(id => Types.ObjectId(id));
    await PermissionsController.deleteUserPermissions({
      _id: { $in: permissionIds },
    });
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
