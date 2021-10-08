/**
 * @name - HostRequest handler
 * @description - This will handle API request for host request module
 */
import urldecode from 'urldecode';
import { success, failure } from '../../utils';
import { ApprovalsController } from './approvals.ctrl';
import { approvalSchemaValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * List host requests
 */
export const listApprovals = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = event.queryStringParameters || {};

    const result = await ApprovalsController.list(
      params,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * create host request
 */
export const createApproval = async (event, context) => {
  try {
    const params = JSON.parse(event.body) || {};
    const errors = approvalSchemaValidation(params);
    if (errors != true) throw errors.shift();
    params['awsUserId'] = event.requestContext.identity.cognitoIdentityId;
    const result = await ApprovalsController.createApproval(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * get host request
 */
export const actionApproval = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const approvalId = event.pathParameters.id;
    const params = JSON.parse(event.body) || {};
    params['awsUserId'] = event.requestContext.identity.cognitoIdentityId;
    const result = await ApprovalsController.actionApproval(
      urldecode(approvalId),
      params
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
