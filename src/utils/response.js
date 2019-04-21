/**
 *
 * @name - response
 * @description - This file will handle all the responses for the api call
 */

/**
 *
 * @description - Internal helper function
 */
const _buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
};

export const success = body => {
  return _buildResponse(200, { status: 'success', result: body });
};

export const failure = body => {
  return _buildResponse(500, { status: 'error', result: body });
};
