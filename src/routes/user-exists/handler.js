/**
 * @name - Check user handler
 * @description - This will handle check user API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { UserController } from '../users/user.ctrl';
import { ERROR_KEYS } from '../../constants';

/**
 * Check user exists
 */
export const checkUserExists = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    if (params && (params.username == '' || params.email == ''))
      throw ERROR_KEYS.MISSING_FIELD;
    const query = {};
    if (params.username) query['username'] = params.username;
    if (params.email) query['email'] = params.email;
    const result = await UserController.isExists(query);
    return successResponse(res, { exists: result });
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
