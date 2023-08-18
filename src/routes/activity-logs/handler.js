/**
 * @name - Activity logs handlar
 * @description - This will handle all activity related API requests
 */
import { ActivityLosController } from './activitylogs.ctrl';
import { successResponse, failureResponse } from '../../utils';

/**
 * List activities
 */
export const listActivities = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    const result = await ActivityLosController.listActivites(
      params,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update activities
 */
export const updateActivities = async (req, res) => {
  try {
    const params = req.body ? req.body : {};
    const result = await ActivityLosController.updateActivities(
      params,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
