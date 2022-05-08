/**
 * @name - Email notification API Handler
 * @description - This handles API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { EmailNotificationController } from './notification.ctrl';
/**
 * Get sync url
 */
export const getSyncUrl = async (req, res) => {
  try {
    // Get search string from queryparams
    const result = await EmailNotificationController.getSyncUrl(req);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const setToken = async (req, res) => {
  try {
    const params = req.body || {};
    const result = await EmailNotificationController.setToken(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const getEmails = async (req, res) => {
  try {
    const result = await EmailNotificationController.getEmails();
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
