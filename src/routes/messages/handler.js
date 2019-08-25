/**
 * @name - Websocket handler
 * @description - Websocket handler for messaging
 */
import { success, failure } from '../../utils';
import { MessageController } from './message.ctrl';
import { ERROR_KEYS } from '../../constants';
import { createMessageValidation } from '../../models';

export const auth = (event, context, callback) => {
  if (!event.queryStringParameters) {
    return callback('region, userpoolId, appClientId, auth must be required');
  }
  const params = event.queryStringParameters || {};
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
    console.log(error);
    return failure(error);
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
    const errors = createMessageValidation(postData);
    if (errors != true) throw errors.shift();
    const message = await MessageController.storeMessage(postData);
    await MessageController.sendMessage(event, message);
    await sendMessageToAllConnected(event, message);
    console.info('Message sent!');
    return success({
      data: 'success',
    });
  } catch (error) {
    console.error(error);
    return failure(error);
  }
};

export const listMessages = async (event, context) => {
  try {
    if (!(event.queryStringParameters && event.queryStringParameters.memberId))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'memberId' };
    // Get search string from queryparams
    const params = event.queryStringParameters || {};

    const result = await MessageController.listMessages(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

export const listConversations = async (event, context) => {
  // Get search string from queryparams
  const params = {
    userId: event.requestContext.identity.cognitoIdentityId,
    groupId:
      event.pathParameters && event.pathParameters.groupId
        ? event.pathParameters.groupId
        : '1',
  };

  try {
    const result = await MessageController.listConversations(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

export const sendMessage = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const errors = createMessageValidation(data);
    if (errors != true) throw errors.shift();

    const result = await MessageController.sendMessageRest({
      ...data,
      fromMemberId: event.requestContext.identity.cognitoIdentityId,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
