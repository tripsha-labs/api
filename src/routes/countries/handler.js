/**
 * @name - Countries API Handler
 * @description - This handles API requests
 */
import { success, failure } from '../../utils';
import { CountryController } from './country.ctrl';

/**
 * List tags
 */
export const listCountries = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    const result = await CountryController.listCountries(params);
    return res.send(result);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};
