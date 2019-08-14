import { success, failure } from '../../utils';
import { TagsController } from './tags.ctrl';

/**
 * List tags
 */
export const listTags = async (event, context) => {
  // Get search string from queryparams
  const params = {
    search: event.queryStringParameters && event.queryStringParameters.search,
    nextPageToken:
      event.queryStringParameters && event.queryStringParameters.nextPageToken,
  };

  try {
    const result = await TagsController.listTags(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
