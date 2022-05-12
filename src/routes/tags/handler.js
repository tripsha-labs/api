/**
 * @name - Tags handler
 * @description - This will handle tags API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { TagsController } from './tags.ctrl';

/**
 * List tags
 */
export const listTags = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    const result = await TagsController.listTags(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
