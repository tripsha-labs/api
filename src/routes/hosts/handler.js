/**
 * @name - HostRequest handler
 * @description - This will handle API request for host request module
 */
import urldecode from 'urldecode';
import { success, failure } from '../../utils';
import { HostRequestController } from './host-request.ctrl';
import { hostRequestValidation } from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * List host requests
 */
export const listHostRequests = async (event, context) => {
  try {
    // Get search string from queryparams
    const params = event.queryStringParameters || {};

    const result = await HostRequestController.list(
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
export const createHostRequest = async (event, context) => {
  try {
    const params = JSON.parse(event.body) || {};
    const errors = hostRequestValidation(params);
    if (errors != true) throw errors.shift();
    params['awsUserId'] = event.requestContext.identity.cognitoIdentityId;
    const result = await HostRequestController.createHostRequest(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * get host request
 */
export const getHostRequest = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const hostId = event.pathParameters.id;

    const result = await HostRequestController.getHostRequest(
      urldecode(hostId)
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Update host request
 */
export const updateHostRequest = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    if (
      data &&
      (data['action'] == 'approved' || data['action'] == 'declined')
    ) {
      const result = await HostRequestController.updateHostRequest(
        urldecode(id),
        {
          ...data,
        },
        event.requestContext.identity.cognitoIdentityId
      );
      return success(result);
    } else {
      throw { ...ERROR_KEYS.BAD_REQUEST };
    }
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Delete host request
 */
export const deleteHostRequest = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const id = event.pathParameters.id;

    const result = await HostRequestController.deleteHostRequest(
      urldecode(id),
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
