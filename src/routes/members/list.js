/**
 * @name - list members
 * @description - Trip member list handler (lambda function)
 */
import { ERROR_CODES, ERROR_KEYS } from '../../constants';
import { success, failure } from '../../utils';
import { errorSanitizer, getTripMembers } from '../../helpers';

export const memberList = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.tripId)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  try {
    const resMembers = await getTripMembers(event.pathParameters.tripId);
    const result = {
      data: resMembers.Items,
      count: resMembers.Count,
    };
    return success(result);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
