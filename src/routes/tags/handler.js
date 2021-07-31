/**
 * @name - Tags handler
 * @description - This will handle tags API requests
 */
import { success, failure } from '../../utils';
import { TagsController } from './tags.ctrl';

/**
 * List tags
 */
export const listTags = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    const result = await TagsController.listTags(params);
    return res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};
