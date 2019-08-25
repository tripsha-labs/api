import { success, failure } from '../../utils';
import { CountryController } from './country.ctrl';

/**
 * List tags
 */
export const listCountries = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await CountryController.listCountries(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
