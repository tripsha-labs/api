/**
 * @name - saved trips
 * @description - saved trips handler (lambda function)
 */
import { ERROR_CODES } from '../../constants';
import { success, failure } from '../../utils';
import { errorSanitizer, getSavedTrips } from '../../helpers';
import _ from 'lodash';

export const savedTrips = async (event, context) => {
  try {
    const resMembers = await getSavedTrips(
      event.requestContext.identity.cognitoIdentityId
    );
    const tripKeys = [];
    _.forEach(resMembers.Items, item => {
      tripKeys.push({ id: item.tripId });
    });
    const result = {
      data: resMembers.Items,
      count: resMembers.Count,
    };
    if (tripKeys.length > 0) {
      const tripPrams = {
        RequestItems: {
          [TABLE_NAMES.TRIP]: {
            Keys: tripKeys,
          },
        },
      };
      const resTrips = await executeQuery('batchGet', tripPrams);
      result['data'] = resTrips.Responses[TABLE_NAMES.TRIP];
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
