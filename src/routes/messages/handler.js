/**
 * @name - Websocket handler
 * @description - Websocket handler for messaging
 */
import https from 'https';
import jose from 'node-jose';
import { success, failure, dbConnect } from '../../utils';
import { MessageController } from './message.ctrl';
import { ERROR_KEYS } from '../../constants';
import { createMessageValidation, UserModel } from '../../models';
import { generateAllow } from './helper';

export const auth = (event, context, callback) => {
  if (!event.queryStringParameters) {
    console.log('region, userpoolId, appClientId, auth must be required');
    return callback('region, userpoolId, appClientId, auth must be required');
  }
  const region = event.queryStringParameters.region;
  const userpoolId = event.queryStringParameters.userpoolId;
  const appClientId = event.queryStringParameters.appClientId;
  const keys_url =
    'https://cognito-idp.' +
    region +
    '.amazonaws.com/' +
    userpoolId +
    '/.well-known/jwks.json';
  const token = event.queryStringParameters.Auth;
  const sections = token.split('.');
  // get the kid from the headers prior to verification
  const header = JSON.parse(jose.util.base64url.decode(sections[0]));
  const kid = header.kid;
  // download the public keys
  https.get(keys_url, response => {
    if (response.statusCode == 200) {
      response.on('data', body => {
        const keys = JSON.parse(body)['keys'];
        // search for the kid in the downloaded public keys
        let keyIndex = -1;
        for (let i = 0; i < keys.length; i++) {
          if (kid == keys[i].kid) {
            keyIndex = i;
            break;
          }
        }
        if (keyIndex == -1) {
          console.log('Public key not found in jwks.json');
          return callback('Public key not found in jwks.json');
        }
        // construct the public key
        jose.JWK.asKey(keys[keyIndex]).then(result => {
          // verify the signature
          jose.JWS.createVerify(result)
            .verify(token)
            .then(res => {
              // now we can use the claims
              const claims = JSON.parse(res.payload);
              // additionally we can verify the token expiration
              const currentTS = Math.floor(new Date() / 1000);
              if (currentTS > claims.exp) {
                return callback('Token is expired');
              }
              // and the Audience (use claims.client_id if verifying an access token)
              if (claims.client_id != appClientId) {
                return callback('Token was not issued for this audience');
              }
              const ga = generateAllow(claims, event.methodArn);
              return callback(null, ga);
            })
            .catch(error => {
              console.log(error);
              return callback('Signature verification failed');
            });
        });
      });
    }
  });
};

export const connectionHandler = async (event, context) => {
  try {
    if (event.requestContext.eventType === 'CONNECT') {
      const connParams = {
        username: event.requestContext.authorizer
          ? event.requestContext.authorizer.username
          : '',
        connectionId: event.requestContext.connectionId,
      };
      await MessageController.addConnection(event, connParams);
      console.info('Connection added');
    } else if (event.requestContext.eventType === 'DISCONNECT') {
      await MessageController.deleteConnection(
        event,
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
    await dbConnect();
    const username = event.requestContext.authorizer.username;
    const user = await UserModel.get({ awsUsername: username });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

    postData['fromMemberId'] = user._id.toString();
    const message = {
      message: await MessageController.storeMessage(postData),
      action: 'newMessage',
    };
    await MessageController.sendMessage(event, message, postData['toMemberId']);
    console.info('Message sent!');
    return success({
      data: 'success',
    });
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

export const listMessages = async (event, context) => {
  try {
    if (!(event.queryStringParameters && event.queryStringParameters.memberId))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'memberId' };
    // Get search string from queryparams
    const params = event.queryStringParameters || {};
    await dbConnect();
    const user = await UserModel.get({
      awsUserId: event.requestContext.identity.cognitoIdentityId,
    });
    params['userId'] = user._id;
    const result = await MessageController.listMessages(params);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

export const listConversations = async (event, context) => {
  // Get search string from queryparams
  const params = event.queryStringParameters || {};
  params['userId'] = event.requestContext.identity.cognitoIdentityId;

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
