/**
 * @name - create
 * @description - Trip create handler (lambda function)
 */
import * as moment from 'moment';
import uuid from 'uuid';
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { getUserById, addMember } from '../../helpers';
import { createTripValidation, validateTripLength } from '../../models';
import { errorSanitizer } from '../../helpers';

export const createTrip = async (event, context) => {
  const data = JSON.parse(event.body) || {};
  // Validate trip fields against the strict schema
  const errors = createTripValidation(data);
  if (errors != true) {
    return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  }
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
  const tripLength = validateTripLength(data['startDate'], data['endDate']);
  if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength)) {
    return failure(ERROR_KEYS.INVALID_DATES, ERROR_CODES.VALIDATION_ERROR);
  }
  data['startDate'] = parseInt(data['startDate']);
  data['endDate'] = parseInt(data['endDate']);
  data['groupSize'] = 1;
  data['tripLength'] = tripLength;
  data['spotFilledRank'] = Math.round(
    (data['groupSize'] / data['maxGroupSize']) * 100
  );
  data['isFull'] = data['spotFilledRank'] == 100;
  const params = {
    TableName: TABLE_NAMES.TRIP,
    Item: {
      ...data, // validated data
      isActive: true,
      isArchived: 0,
      id: uuid.v1(),
      createdAt: moment().unix(),
      updatedAt: moment().unix(),
      ownerId: event.requestContext.identity.cognitoIdentityId,
    },
    ReturnValues: 'ALL_OLD',
  };
  try {
    const resTrip = await executeQuery('put', params);
    const resMember = await addMember(
      params.Item.id,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(params.Item.id);
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
