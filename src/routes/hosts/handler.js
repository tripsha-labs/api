/**
 * @name - HostRequest handler
 * @description - This will handle API request for host request module
 */
import urldecode from 'urldecode';
import { successResponse, failureResponse } from '../../utils';
import { HostRequestController } from './host-request.ctrl';
import { hostRequestValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * List host requests
 */
export const listHostRequests = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query || {};
    const result = await HostRequestController.list(
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
export const createHostRequest = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = hostRequestValidation(params);
    if (errors != true) throw errors.shift();
    params['awsUserId'] = req.requestContext.identity.cognitoIdentityId;
    const result = await HostRequestController.createHostRequest(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * get host request
 */
export const getHostRequest = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const hostId = req.params.id;

    const result = await HostRequestController.getHostRequest(
      urldecode(hostId)
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update host request
 */
export const updateHostRequest = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const id = req.params.id;
    const data = req.body;
    if (
      data &&
      (data['action'] == 'approved' || data['action'] == 'declined')
    ) {
      const result = await HostRequestController.updateHostRequest(
        urldecode(id),
        {
          ...data,
        },
        req.requestContext.identity.cognitoIdentityId
      );
      return successResponse(res, result);
    } else {
      throw { ...ERROR_KEYS.BAD_REQUEST };
    }
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete host request
 */
export const deleteHostRequest = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const id = req.params.id;

    const result = await HostRequestController.deleteHostRequest(
      urldecode(id),
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
