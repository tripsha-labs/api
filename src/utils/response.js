import { ERROR_KEYS } from '../constants';
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

export const failure = (body, httpCode = 400) => {
  httpCode = body && body.code ? body.code : httpCode;
  if (body && body.errors) {
    const values = Object.values(body.errors);
    body = values[0].properties;
  } else if (body && body.type) {
    body = body;
  } else {
    body = ERROR_KEYS.INTERNAL_SERVER_ERROR;
  }
  return _buildResponse(httpCode, { status: 'error', result: body });
};
