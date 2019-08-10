/**
 * @name - Websocket handler
 * @description - Websocket handler for messaging
 */
import { success, failure } from '../../utils';

import { ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';

import { MessageController } from './message.ctrl';

export const auth = (event, context, callback) => {
  if (!event.queryStringParameters) {
    console.log('region, userpoolId, appClientId, auth must be required');
    return callback('region, userpoolId, appClientId, auth must be required');
  }
  const params = event.queryStringParameters;
  return callback(MessageController.auth(params));
};

export const connectionHandler = async (event, context) => {
  try {
    if (event.requestContext.eventType === 'CONNECT') {
      const connParams = {
        username: requestContext.authorizer
          ? requestContext.authorizer.username
          : '',
        connectionId: requestContext.connectionId,
      };
      await MessageController.addConnection(connParams);
      console.info('Connection added');
    } else if (event.requestContext.eventType === 'DISCONNECT') {
      await MessageController.deleteConnection(
        event.requestContext.connectionId
      );
      console.info('Connection removed');
    }

    return success({
      data: 'success',
    });
  } catch (error) {
    console.error('Failed to esablish/remove connection');
    console.error(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

export const defaultHandler = async (event, context) => {
  return success({
    data: 'Default Handler',
  });
};

export const sendMessageHandler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const postData = JSON.parse(body.data);
    const message = await MessageController.storeMessage(postData);
    await MessageController.sendMessage(event, message);
    // await sendMessageToAllConnected(event, message);
    console.info('Message sent!');
    return success({
      data: 'success',
    });
  } catch (error) {
    console.error(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};
