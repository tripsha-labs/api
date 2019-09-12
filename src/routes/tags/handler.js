/**
 * @name - Tags handler
 * @description - This will handle tags API requests
 */
import { success, failure } from '../../utils';
import { TagsController } from './tags.ctrl';

/**
 * List tags
 */
export const listTags = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await TagsController.listTags(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
