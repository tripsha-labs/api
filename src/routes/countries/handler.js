import { ERROR_CODES } from '../../constants';
import { success, failure } from '../../utils';
import { errorSanitizer } from '../../helpers';
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
    const { error, result } = await CountryController.listCountries(params);
    if (error !== null) {
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
