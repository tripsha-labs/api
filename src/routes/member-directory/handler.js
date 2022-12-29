/**
 * @name - Members API Handler
 * @description - This handles API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { MemberDirectoryController } from './member-directory.ctrl';
import { ERROR_KEYS } from '../../constants';
import { UserModel } from '../../models';
/**
 * List members
 */
export const listMembers = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    params.hostId = req.currentUser._id.toString();
    const result = await MemberDirectoryController.listMembers(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const createMembers = async (req, res) => {
  try {
    const params = req.body || {};
    if (params.members?.length > 0) {
      await MemberDirectoryController.createMembers(
        params.members,
        req.currentUser
      );
    }
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const deleteMembers = async (req, res) => {
  try {
    const params = req.body || {};
    if (params?.memberIds?.length > 0) {
      await MemberDirectoryController.deleteMembers(params.memberIds);
    }
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
