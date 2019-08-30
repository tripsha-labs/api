import https from 'https';
import moment from 'moment';
import jose from 'node-jose';
import { dbConnect, dbClose } from '../../utils/db-connect';
import { prepareCommonFilter } from '../../helpers';
import { generateAllow } from './helper';
import { UserModel, MessageModel, ConversationModel } from '../../models';
import { apigwManagementApi } from '../../utils';

export class MessageController {
  static async listMessages(filter) {
    try {
      const params = {
        filter: {
          $or: [
            { toMemberId: filter.memberId },
            { fromMemberId: filter.memberId },
          ],
        },
        ...prepareCommonFilter(filter, ['updatedAt']),
      };
      await dbConnect();
      const messages = await MessageModel.list(params);
      const messagesCount = await MessageModel.count(params.filter);

      return {
        data: messages,
        count: messagesCount,
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async listConversations(filter) {
    try {
      const params = {
        filter: {
          userId: filter.memberId,
        },
        ...prepareCommonFilter(filter, ['updatedAt']),
      };
      await dbConnect();
      const conversations = await ConversationModel.list(params);
      const conversationsCount = await ConversationModel.count(params.filter);

      return {
        data: conversations,
        count: conversationsCount,
      };
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async sendMessageRest(message) {
    try {
      await dbConnect();
      const resMessage = await MessageModel.create(message);
      return resMessage;
    } catch (error) {
      throw error;
    } finally {
      dbClose();
    }
  }

  static async auth(authFilter, event, context) {
    try {
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
      return https.get(keys_url, response => {
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
              return { error: 'Public key not found in jwks.json' };
            }
            // construct the public key
            return jose.JWK.asKey(keys[keyIndex]).then(result => {
              // verify the signature
              return jose.JWS.createVerify(result)
                .verify(token)
                .then(result => {
                  // now we can use the claims
                  const claims = JSON.parse(result.payload);
                  // additionally we can verify the token expiration
                  const currentTS = Math.floor(new Date() / 1000);
                  if (currentTS > claims.exp) {
                    console.log('Token is expired');
                    return { error: 'Token is expired' };
                  }
                  // and the Audience (use claims.client_id if verifying an access token)
                  if (claims.client_id != appClientId) {
                    console.log('Token was not issued for this audience');
                    return {
                      error: 'Token was not issued for this audience',
                    };
                  }
                  const ga = generateAllow(claims, event.methodArn);
                  return {
                    error: null,
                    result: ga,
                  };
                })
                .catch(error => {
                  console.log('Signature verification failed');
                  console.log(error);
                  return { error: 'Signature verification failed' };
                });
            });
          });
        } else {
          console.log('Key verification failed');
          return { error: 'Key verification failed' };
        }
      });
    } catch (error) {
      console.log(error);
      return { error: 'Key verification failed' };
    }
  }

  static async addConnection(connParams) {
    try {
      await dbConnect();
      const user = await UserModel.getUserByAWSUsername(connParams.username);
      const params = {
        connectionId: connParams.connectionId,
        awsUsername: connParams.username,
        userId: user._id,
        isOnline: true,
      };

      await ConversationModel.addOrUpdate({ userId: user._id }, params);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async deleteConnection(connectionId) {
    try {
      await dbConnect();
      const params = {
        connectionId: null,
        isOnline: false,
        lastOnlineTime: moment().unix(),
      };
      await ConversationModel.updateOne({ connectionId: connectionId }, params);
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }

  static async storeMessage(messageParams) {
    const params = {
      toMemberId: messageParams.userId,
      fromMemberId: messageParams.fromMemberId,
      message: messageParams.message,
      messageType: 'text',
    };

    try {
      const message = await MessageModel.create(params);
      const conversationParams = {
        userId: params['toMemberId'],
        message: messageParams.message,
        messageType: 'text',
      };
      await ConversationModel.addOrUpdate(conversationParams);
      conversationParams['userId'] = params['fromMemberId'];
      await ConversationModel.addOrUpdate(conversationParams);
      return message;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async sendMessage(event, message) {
    const conversation = await ConversationModel.get({
      userId: message.toMemberId,
    });
    if (conversation.connectionId == null) return Promise.resolve();
    return MessageController.send(event, conversation.connectionId, message);
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
