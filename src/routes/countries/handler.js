import { success, failure } from '../../utils';
import { CountryController } from './country.ctrl';

/**
 * List tags
 */
export const listCountries = async (event, context) => {
  // Get search string from queryparams
  const params = {
    search: event.queryStringParameters && event.queryStringParameters.search,
    nextPageToken:
      event.queryStringParameters && event.queryStringParameters.nextPageToken,
  };

  try {
    const result = await CountryController.listCountries(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
