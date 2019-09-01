import { success, failure } from '../../utils';
import { MemberController } from './member.ctrl';
import { memberActionValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * List members
 */
export const listMembers = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    // Get search string from queryparams
    const queryParams = event.queryStringParameters
      ? event.queryStringParameters
      : {};

    const params = {
      tripId: event.pathParameters.id,
      ...queryParams,
    };

    const result = await MemberController.list(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Member actions
 */
export const memberActions = async (event, context) => {
  try {
    const params = JSON.parse(event.body) || {};
    const errors = memberActionValidation(params);
    if (errors != true) throw errors.shift();
    const result = await MemberController.memberAction(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
