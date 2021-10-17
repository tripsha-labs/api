/**
 * @name - Websocket handler
 * @description - Websocket handler for messaging
 */
import https from 'https';
import jose from 'node-jose';
import {
  success,
  failure,
  successResponse,
  failureResponse,
  dbConnect,
} from '../../utils';
import { MessageController } from './message.ctrl';
import { ERROR_KEYS } from '../../constants';
import { createMessageValidation, UserModel, MemberModel } from '../../models';
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
      if (event.queryStringParameters) {
        const connParams = {
          userId: event.queryStringParameters.userId,
          connectionId: event.requestContext.connectionId,
          awsUsername: event.requestContext.authorizer.username,
        };
        await MessageController.addConnection(event, connParams);
        console.info('Connection added');
      }
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

export const readMessageHandler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const postData = JSON.parse(body.data);
    await dbConnect();
    const username = event.requestContext.authorizer.username;
    const user = await UserModel.get({ awsUsername: username });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;

    postData.sender = user._id.toString();
    postData.receiver = postData.userId;
    await MessageController.readMessages(event, postData);
    return success({
      data: 'success',
    });
  } catch (error) {
    console.log(error);
    return failure(error);
  }
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
    if (
      postData['isGroupMessage'] &&
      (postData['isGroupMessage'] == true ||
        postData['isGroupMessage'] == 'true')
    ) {
      const memberParams = {
        tripId: postData['toMemberId'],
        memberId: user._id,
        isMember: true,
      };
      const memberInfo = await MemberModel.get(memberParams);
      if (memberInfo == null) throw ERROR_KEYS.NOT_GROUP_MEMBER;
    }

    const message = {
      message: await MessageController.storeMessage(postData),
      action: 'newMessage',
    };

    await MessageController.sendMessage(event, message, postData);
    console.info('Message sent!');
    return success({
      data: 'success',
    });
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

export const listMessages = async (req, res) => {
  // Get search string from queryparams
  const params = req.queryStringParameters || {};
  const { memberId, tripId } = params;
  try {
    if (memberId || tripId) {
      params['awsUserId'] = req.requestContext.identity.cognitoIdentityId;
      const result = await MessageController.listMessages(params);
      return successResponse(res, result);
    } else {
      if (!memberId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'memberId' };
      else throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    }
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const listConversations = async (req, res) => {
  // Get search string from queryparams
  const params = req.queryStringParameters || {};
  params['userId'] = req.requestContext.identity.cognitoIdentityId;

  try {
    const result = await MessageController.listConversations(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const errors = createMessageValidation(data);
    if (errors != true) throw errors.shift();

    const result = await MessageController.sendMessageRest(
      {
        ...data,
        fromMemberId: req.requestContext.identity.cognitoIdentityId,
      },
      req
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
