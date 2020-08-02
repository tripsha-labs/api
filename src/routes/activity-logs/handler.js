/**
 * @name - Activity logs handlar
 * @description - This will handle all activity related API requests
 */
import { ActivityLosController } from './activitylogs.ctrl';
import { success, failure } from '../../utils';

/**
 * List activities
 */
export const listActivities = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await ActivityLosController.listActivites(
      params,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
