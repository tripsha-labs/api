/**
 * @name - Trips tags handler
 * @description - This will handle trip tags API requests
 */
import { success, failure } from '../../utils';
import { TripTagsController } from './trip-tags.ctrl';

/**
 * List tags
 */
export const listTripTags = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await TripTagsController.listTags(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
