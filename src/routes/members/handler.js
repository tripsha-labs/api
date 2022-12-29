/**
 * @name - Member handler
 * @description - This will handle API request for member module
 */
import { successResponse, failureResponse } from '../../utils';
import { MemberController } from './member.ctrl';
import { memberActionValidation } from '../../models';

/**
 * Member actions
 */
export const memberActions = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = memberActionValidation(params);
    if (errors != true) throw errors.shift();
    params['awsUserId'] = req.requestContext.identity.cognitoIdentityId;
    const result = await MemberController.memberAction(params, req.currentUser);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
