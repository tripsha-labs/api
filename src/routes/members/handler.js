import { ERROR_KEYS } from '../../constants';
import { success, failure } from '../../utils';
import { errorSanitizer } from '../../helpers';
import { MemberController } from './member.ctrl';

/**
 * List members
 */
export const listMembers = async (event, context) => {
  // Get search string from queryparams
  const params = {
    tripId: event.pathParameters.id,
  };

  try {
    const { error, result } = await MemberController.listMembers(params);
    if (error !== null) {
      return failure(errorSanitizer(error), ERROR_KEYS.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_KEYS.VALIDATION_ERROR);
  }
};

/**
 * Member actions
 */
export const memberActions = async (event, context) => {
  // Get search string from queryparams
  const params = {
    tripId: event.pathParameters.id,
  };
  const data = JSON.parse(event.body) || {};
  const errors = memberValidation(data);
  if (errors != true) {
    return failure(errors, ERROR_KEYS.VALIDATION_ERROR);
  }

  try {
    const { error, result } = await MemberController.memberAction(params, data);
    if (error !== null) {
      return failure(errorSanitizer(error), ERROR_KEYS.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_KEYS.VALIDATION_ERROR);
  }
};
