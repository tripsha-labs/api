import https from 'https';
import * as moment from 'moment';
import uuid from 'uuid';
import { generateAllow } from './helper';
import {
  UserModel,
  ConnectionModel,
  MessageModel,
  ConversationModel,
} from '../../models';
import { apigwManagementApi } from '../../utils';
const jose = require('node-jose');

export class MessageController {
  static async auth(authFilter) {
    const region = authFilter.region;
    const userpoolId = authFilter.userpoolId;
    const appClientId = authFilter.appClientId;
    const keys_url =
      'https://cognito-idp.' +
      region +
      '.amazonaws.com/' +
      userpoolId +
      '/.well-known/jwks.json';
    const token = authFilter.Auth;
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
            return { error: 'Public key not found in jwks.json' };
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
                  return { error: 'Token is expired' };
                }
                // and the Audience (use claims.client_id if verifying an access token)
                if (claims.client_id != appClientId) {
                  return {
                    error: 'Token was not issued for this audience',
                  };
                }
                return {
                  error: null,
                  result: generateAllow(claims, event.methodArn),
                };
              })
              .catch(() => {
                return { error: 'Signature verification failed' };
              });
          });
        });
      } else {
        return { error: 'Key verification failed' };
      }
    });
  }

  static async addConnection(connParams) {
    const userModel = new UserModel();
    const connModel = new ConnectionModel();
    const userlist = await userModel.getUserByUsername(connParams.username);
    const params = {
      connectionId: connParams.connectionId,
      username: connParams.username,
    };
    if (userlist && userlist.Items && userlist.Items.length > 0) {
      params['userId'] = userlist.Items[0].id;
    }
    return connModel.add(params);
  }

  static async deleteConnection(connectionId) {
    const connModel = new ConnectionModel();
    return connModel.delete(connectionId);
  }

  static async storeMessage(messageParams) {
    const params = {
      groupId: messageParams.groupId ? messageParams.groupId : '1',
      toMemberId: messageParams.userId,
      fromMemberId: messageParams.fromMemberId,
      message: messageParams.message,
      sentOn: moment().unix(),
      messageType: 'text',
      id: uuid.v1(),
    };

    try {
      const messageModel = new MessageModel();
      const conversationModel = new ConversationModel();
      await messageModel.add(params);
      const conversations = await conversationModel.list({
        ':userId': params['fromMemberId'],
        ':memberId': params['toMemberId'],
        ':groupId': params['groupId'],
      });
      if (
        !(
          conversations &&
          conversations.Items &&
          conversations.Items.length > 0
        )
      ) {
        await conversationModel.add(params);
      }
      console.info('Message stored!');
      return params;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async sendMessage(event, message) {
    const connModel = new ConnectionModel();
    const connections = await connModel.list(message.toMemberId);
    const promises = [];
    connections.Items.map(connectionId => {
      promises.push(
        MessageController.send(event, connectionId.connectionId, message)
      );
    });
    return Promise.all(promises);
  }

  static send(event, connectionId, message) {
    const endpoint =
      event.requestContext.domainName + '/' + event.requestContext.stage;
    const apigwManagement = apigwManagementApi(endpoint);

    const params = {
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    };
    return apigwManagement.postToConnection(params).promise();
  }
}
