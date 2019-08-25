import { success, failure } from '../../utils';
import { MemberController } from './member.ctrl';

/**
 * List members
 */
export const listMembers = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};

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
    const result = await MemberController.memberAction(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
