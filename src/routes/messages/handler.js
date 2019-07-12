/**
 * @name - Websocket handler
 * @description - Websocket handler for messaging
 */
import {
  success,
  failure,
  executeQuery,
  apigwManagementApi,
} from '../../utils';
import { TABLE_NAMES, ERROR_CODES } from '../../constants';
import { errorSanitizer } from '../../helpers';
import * as moment from 'moment';
import uuid from 'uuid';
import https from 'https';
const jose = require('node-jose');

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
            .then(result => {
              // now we can use the claims
              const claims = JSON.parse(result.payload);
              // additionally we can verify the token expiration
              const currentTS = Math.floor(new Date() / 1000);
              if (currentTS > claims.exp) {
                return callback('Token is expired');
              }
              // and the Audience (use claims.client_id if verifying an access token)
              if (claims.client_id != appClientId) {
                return callback('Token was not issued for this audience');
              }
              return callback(null, generateAllow(claims, event.methodArn));
            })
            .catch(() => {
              return callback('Signature verification failed');
            });
        });
      });
    }
  });
};

const generatePolicy = (claims, effect, resource) => {
  // Required output:
  const authResponse = {};
  authResponse.principalId = 'me';
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    username: claims.username,
    sub: claims.sub,
  };
  return authResponse;
};

const generateAllow = (claims, resource) => {
  return generatePolicy(claims, 'Allow', resource);
};

const generateDeny = (claims, resource) => {
  return generatePolicy(claims, 'Deny', resource);
};

export const connectionHandler = async (event, context) => {
  try {
    if (event.requestContext.eventType === 'CONNECT') {
      await addConnection(event.requestContext);
    } else if (event.requestContext.eventType === 'DISCONNECT') {
      await deleteConnection(event.requestContext.connectionId);
    }
    console.info('Connection added/removed');
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
    const message = await storeMessage(event);
    await sendMessageToAllConnected(event, message);
    console.info('Message sent!');
    return success({
      data: 'success',
    });
  } catch (error) {
    console.error(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

const sendMessageToAllConnected = async (event, message) => {
  const connectionData = await getConnectionIds(event, message);
  const promises = [];
  connectionData.Items.map(connectionId => {
    promises.push(send(event, connectionId.connectionId, message));
  });
  return Promise.all(promises);
};

const storeMessage = async event => {
  const body = JSON.parse(event.body);
  const postData = JSON.parse(body.data);
  const username = event.requestContext.authorizer
    ? event.requestContext.authorizer.username
    : '';

  const params = {
    TableName: TABLE_NAMES.MESSAGES,
    Item: {
      groupId: postData.groupId ? postData.groupId : '1',
      toMemberId: postData.userId,
      message: postData.message,
      sentOn: moment().unix(),
      type: 'text',
      id: uuid.v1(),
    },
  };
  const userlist = await getUserId(username);
  if (userlist && userlist.Items && userlist.Items.length > 0) {
    params.Item['fromMemberId'] = userlist.Items[0].id;
  }
  try {
    await executeQuery('put', params);
    console.info('Message stored!');
    return params.Item;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUserId = username => {
  const params = {
    TableName: TABLE_NAMES.USER,
    ExpressionAttributeValues: {
      ':username': username,
    },
    FilterExpression: 'username=:username',
  };

  return executeQuery('scan', params);
};

const getConnectionIds = (event, message) => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    ProjectionExpression: 'connectionId',
    ExpressionAttributeValues: {
      ':userId': message.toMemberId,
    },
    FilterExpression: 'userId=:userId',
  };

  return executeQuery('scan', params);
};

const send = (event, connectionId, message) => {
  const endpoint =
    event.requestContext.domainName + '/' + event.requestContext.stage;
  const apigwManagement = apigwManagementApi(endpoint);

  const params = {
    ConnectionId: connectionId,
    Data: JSON.stringify(message),
  };
  return apigwManagement.postToConnection(params).promise();
};

const addConnection = async requestContext => {
  const username = requestContext.authorizer
    ? requestContext.authorizer.username
    : '';

  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    Item: {
      connectionId: requestContext.connectionId,
      username: username,
    },
  };
  const userlist = await getUserId(username);
  if (userlist && userlist.Items && userlist.Items.length > 0) {
    params.Item['userId'] = userlist.Items[0].id;
  }
  return executeQuery('put', params);
};

const deleteConnection = connectionId => {
  const params = {
    TableName: TABLE_NAMES.CONNECTIONS,
    Key: {
      connectionId: connectionId,
    },
  };
  return executeQuery('delete', params);
};
