import { success, failure } from '../../utils';
import { MemberController } from './member.ctrl';
import { memberValidation } from '../../models';

/**
 * List members
 */
export const listMembers = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = {
      tripId: event.pathParameters && event.pathParameters.id,
    };

    const result = await MemberController.listMembers(params);
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
    const data = JSON.parse(event.body) || {};
    const errors = memberValidation(data);
    if (errors != true) throw errors.shift();
    const params = {
      tripId: data.tripId,
    };
    const result = await MemberController.memberAction(params, data);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
