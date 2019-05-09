/**
 * @name - publicList
 * @description - Public trip list handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { queryBuilder, keyPrefixAlterer, errorSanitizer } from '../../helpers';

export const listPublicTrips = async (event, context) => {
  const params = {
    TableName: TABLE_NAMES.TRIP,
  };

  try {
    const resTrips = await executeQuery('scan', params);
    return success({
      data: resTrips.Items,
      totalCount: resTrips.ScannedCount,
      currentCount: resTrips.Count,
    });
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
