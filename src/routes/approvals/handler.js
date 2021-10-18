/**
 * @name - HostRequest handler
 * @description - This will handle API request for host request module
 */
import urldecode from 'urldecode';
import { successResponse, failureResponse } from '../../utils';
import { ApprovalsController } from './approvals.ctrl';
import { approvalSchemaValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * List host requests
 */
export const listApprovals = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query || {};

    const result = await ApprovalsController.list(
      params,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * create host request
 */
export const createApproval = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = approvalSchemaValidation(params);
    if (errors != true) throw errors.shift();
    params['awsUserId'] = req.requestContext.identity.cognitoIdentityId;
    const result = await ApprovalsController.createApproval(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * get host request
 */
export const actionApproval = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const approvalId = req.params.id;
    const params = req.body || {};
    params['awsUserId'] = req.requestContext.identity.cognitoIdentityId;
    const result = await ApprovalsController.actionApproval(
      urldecode(approvalId),
      params
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
