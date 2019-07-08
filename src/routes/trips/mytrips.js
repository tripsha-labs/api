/**
 * @name - my trips
 * @description - my trips handler (lambda function)
 */
import { ERROR_CODES, TABLE_NAMES } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import {
  errorSanitizer,
  getMyTrips,
  injectUserDetails,
  injectFavoriteDetails,
} from '../../helpers';
import _ from 'lodash';

export const myTrips = async (event, context) => {
  try {
    const resMembers = await getMyTrips(
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
      const tripParams = {
        RequestItems: {
          [TABLE_NAMES.TRIP]: {
            Keys: tripKeys,
          },
        },
      };
      const resTrips = await executeQuery('batchGet', tripParams);

      result['data'] = await injectUserDetails(
        resTrips.Responses[TABLE_NAMES.TRIP]
      );
      result['data'] = await injectFavoriteDetails(
        result['data'],
        event.requestContext.identity.cognitoIdentityId
      );
    }

    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
