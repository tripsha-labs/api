/**
 * @name - Message Controller
 * @description - This contains business logic for messages module
 */
import https from 'https';
import moment from 'moment';
import jose from 'node-jose';
import { dbConnect, dbClose } from '../../utils/db-connect';
import { prepareCommonFilter, prepareSortFilter } from '../../helpers';
import { generateAllow } from './helper';
import { UserModel, MessageModel, ConversationModel } from '../../models';
import { apigwManagementApi } from '../../utils';
import { ERROR_KEYS, APP_CONSTANTS } from '../../constants';

export class MessageController {
  static async listMessages(filter) {
    try {
      const params = {
        filter: {
          $or: [
            {
              $and: [
                { toMemberId: filter.memberId },
                { fromMemberId: filter.userId },
              ],
            },
            {
              $and: [
                { fromMemberId: filter.memberId },
                { toMemberId: filter.userId },
              ],
            },
          ],
        },
        ...prepareCommonFilter(filter, ['updatedAt']),
      };
      await dbConnect();
      const messages = await MessageModel.list(params);
      const messagesCount = await MessageModel.count(params.filter);

      return {
        data: messages,
        count: messages.length,
        totalCount: messagesCount,
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
      await dbConnect();
      const user = await UserModel.get({ awsUserId: filter.userId });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      const filterParams = {
        memberId: user._id.toString(),
      };

      const params = [{ $match: filterParams }];
      params.push({
        $project: {
          userId: {
            $toObjectId: '$userId',
          },
          isOnline: 1,
          lastOnlineTime: 1,
          message: 1,
          created_at: 1,
          updated_at: 1,
        },
      });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      });
      params.push({
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      });
      params.push({
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$$ROOT', '$user'] },
        },
      });
      params.push({
        $sort: prepareSortFilter(
          filter,
          ['updatedAt', 'username'],
          'updatedAt'
        ),
      });
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $limit: limit });
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });

      const conversations = await ConversationModel.aggregate(params);
      const conversationsCount = await ConversationModel.count(filterParams);

      return {
        data: conversations,
        totalCount: conversationsCount,
        count: conversations.length,
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
      const user = await UserModel.get({ awsUserId: message.fromMemberId });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      message['fromMemberId'] = user._id;
      const resMessage = await MessageModel.create(message);
      const params = {
        userId: user._id,
        message: message.message,
        memberId: message.toMemberId,
      };
      await ConversationModel.addOrUpdate(
        { userId: user._id, memberId: message.toMemberId },
        params
      );
      params['userId'] = message.toMemberId;
      params['memberId'] = user._id;
      await ConversationModel.addOrUpdate(
        { userId: message.toMemberId, memberId: user._id },
        params
      );
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
    try {
      const message = await MessageModel.create(messageParams);
      const conversationParams = {
        userId: messageParams['toMemberId'],
        memberId: messageParams['fromMemberId'],
        message: messageParams.message,
        messageType: 'text',
      };
      await ConversationModel.addOrUpdate(
        {
          userId: messageParams['toMemberId'],
          memberId: messageParams['fromMemberId'],
        },
        conversationParams
      );
      conversationParams['userId'] = messageParams['fromMemberId'];
      conversationParams['memberId'] = messageParams['toMemberId'];
      await ConversationModel.addOrUpdate(
        {
          userId: messageParams['fromMemberId'],
          memberId: messageParams['toMemberId'],
        },
        conversationParams
      );
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
