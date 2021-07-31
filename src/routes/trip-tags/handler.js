/**
 * @name - Trips tags handler
 * @description - This will handle trip tags API requests
 */
import { success, failure } from '../../utils';
import { TripTagsController } from './trip-tags.ctrl';

/**
 * List tags
 */
export const listTripTags = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    const result = await TripTagsController.listTags(params);
    return res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};
