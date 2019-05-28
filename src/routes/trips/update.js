/**
 * @name - update
 * @description - Trip update handler (lambda function)
 */
import { success, failure, executeQuery } from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import {
  updateTripValidation,
  updateTripDefaultValues,
  validateTripLength,
} from '../../models';
import { queryBuilder, keyPrefixAlterer, errorSanitizer } from '../../helpers';

export const updateTrip = async (event, context) => {
  const data = JSON.parse(event.body) || {};

  // Validate trip fields against the strict schema
  const errors = updateTripValidation(data);
  if (errors != true) return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  // update data object with default fields and values ex. updatedAt
  const trip = { ...data, ...updateTripDefaultValues };
  try {
    const user = await getUserById(
      event.requestContext.identity.cognitoIdentityId
    );
    if (!user || !user.Item) throw 'UserNotFound';
    const memberInfo = {};
    if (user.Item['firstName'])
      memberInfo['firstName'] = user.Item['firstName'];
    if (user.Item['lastName']) memberInfo['lastName'] = user.Item['lastName'];
    if (user.Item['avatarUrl'])
      memberInfo['avatarUrl'] = user.Item['avatarUrl'];
    data['createdBy'] = memberInfo;
  } catch (error) {
    return failure(ERROR_KEYS.ITEM_NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
  }
  if (data['startDate'] || data['endDate']) {
    const tripLength = validateTripLength(data['startDate'], data['endDate']);
    if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength))
      return failure(ERROR_KEYS.INVALID_DATES, ERROR_CODES.VALIDATION_ERROR);
    data['tripLength'] = tripLength;
    data['startDate'] = parseInt(data['startDate']);
    data['endDate'] = parseInt(data['endDate']);
  }
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: event.pathParameters.id,
    },
    UpdateExpression: 'SET ' + queryBuilder(trip),
    ExpressionAttributeValues: keyPrefixAlterer(trip),
    ReturnValues: 'ALL_NEW',
  };
  try {
    await executeQuery('update', params);
    return success('success');
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
