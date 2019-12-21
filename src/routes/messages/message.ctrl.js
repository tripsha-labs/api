/**
 * @name - Message Controller
 * @description - This contains business logic for messages module
 */
import https from 'https';
import { Types } from 'mongoose';
import moment from 'moment';
import jose from 'node-jose';
import _ from 'lodash';
import { dbConnect, apigwManagementApi } from '../../utils';
import { prepareCommonFilter, prepareSortFilter } from '../../helpers';
import { generateAllow } from './helper';
import {
  UserModel,
  MessageModel,
  ConversationModel,
  ConnectionModel,
} from '../../models';
import { ERROR_KEYS, APP_CONSTANTS } from '../../constants';

export class MessageController {
  static async listMessages(filter) {
    try {
      await dbConnect();

      let filterParams = {};

      if (
        filter.isGroup &&
        (filter.isGroup === true || filter.isGroup === 'true')
      ) {
        filterParams = { tripId: filter.tripId };
      } else {
        const user = await UserModel.get({
          awsUserId: filter.awsUserId,
        });
        filterParams = {
          $or: [
            {
              $and: [
                { toMemberId: filter.memberId },
                { fromMemberId: user._id.toString() },
              ],
            },
            {
              $and: [
                { fromMemberId: filter.memberId },
                { toMemberId: user._id.toString() },
              ],
            },
          ],
        };
      }
      const fromMemberProjection = {
        'fromMember.avatarUrl': 1,
        'fromMember._id': 1,
        'fromMember.awsUserId': 1,
        'fromMember.awsUsername': 1,
        'fromMember.firstName': 1,
        'fromMember.username': 1,
        'fromMember.isOnline': 1,
        'fromMember.lastOnlineTime': 1,
      };
      const messageProjection = {
        message: 1,
        createdAt: 1,
        updatedAt: 1,
        messageType: 1,
        mediaUrl: 1,
        isGroupMessage: 1,
        isEdited: 1,
        _id: 1,
        tripId: 1,
      };
      const params = [{ $match: filterParams }];
      params.push({
        $project: {
          fromMemberId: {
            $toObjectId: '$fromMemberId',
          },
          ...messageProjection,
        },
      });
      params.push({
        $sort: prepareSortFilter(filter, ['updatedAt'], 'updatedAt'),
      });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'fromMemberId',
          foreignField: '_id',
          as: 'fromMember',
        },
      });
      params.push({
        $unwind: {
          path: '$fromMember',
          preserveNullAndEmptyArrays: true,
        },
      });
      params.push({
        $project: {
          fromMemberId: 1,
          tripId: 1,
          ...messageProjection,
          ...fromMemberProjection,
        },
      });
      const messages = await MessageModel.aggregate(params);
      console.log(messages);
      const messagesCount = await MessageModel.count(filterParams);

      return {
        data: messages,
        count: messages.length,
        totalCount: messagesCount,
      };
    } catch (error) {
      console.log(error);
      throw error;
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

      const memberProjection = {
        message: 1,
        createdAt: 1,
        updatedAt: 1,
        messageType: 1,
        joinedOn: 1,
        isGroup: 1,
      };
      const tripProjection = {
        'trip.title': 1,
        'trip.startDate': 1,
        'trip.endDate': 1,
        'trip.pictureUrls': 1,
        'trip.ownerId': 1,
        'trip.groupSize': 1,
        'trip._id': 1,
      };
      const userProjection = {
        'user.avatarUrl': 1,
        'user._id': 1,
        'user.awsUserId': 1,
        'user.awsUsername': 1,
        'user.firstName': 1,
        'user.username': 1,
        'user.isOnline': 1,
        'user.lastOnlineTime': 1,
      };
      const ownerProjection = {
        'ownerDetails.avatarUrl': 1,
        'ownerDetails._id': 1,
        'ownerDetails.awsUserId': 1,
        'ownerDetails.awsUsername': 1,
        'ownerDetails.firstName': 1,
        'ownerDetails.username': 1,
        'ownerDetails.isOnline': 1,
        'ownerDetails.lastOnlineTime': 1,
      };
      const params = [{ $match: filterParams }];
      params.push({
        $project: {
          userId: {
            $toObjectId: '$userId',
          },
          tripId: {
            $toObjectId: '$tripId',
          },
          ...memberProjection,
        },
      });
      params.push({
        $sort: prepareSortFilter(filter, ['updatedAt'], 'updatedAt'),
      });

      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $limit: limit });
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });

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
        $lookup: {
          from: 'trips',
          localField: 'tripId',
          foreignField: '_id',
          as: 'trip',
        },
      });
      params.push({
        $unwind: {
          path: '$trip',
          preserveNullAndEmptyArrays: true,
        },
      });
      params.push({
        $lookup: {
          from: 'users',
          localField: 'trip.ownerId',
          foreignField: '_id',
          as: 'ownerDetails',
        },
      });
      params.push({
        $unwind: {
          path: '$ownerDetails',
          preserveNullAndEmptyArrays: true,
        },
      });
      params.push({
        $project: {
          userId: 1,
          tripId: 1,
          ...memberProjection,
          ...tripProjection,
          ...userProjection,
          ...ownerProjection,
        },
      });

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
    }
  }

  static async sendMessageRest(message, event) {
    try {
      await dbConnect();
      const user = await UserModel.get({ awsUserId: message.fromMemberId });
      if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
      message['fromMemberId'] = user._id.toString();
      const resMessage = await MessageModel.create(message);
      const params = {
        memberId: message.toMemberId,
        message: message.message,
        userId: message.fromMemberId,
      };
      await ConversationModel.addOrUpdate(
        { userId: message.fromMemberId, memberId: message.toMemberId },
        params
      );
      params['userId'] = message.toMemberId;
      params['memberId'] = message.fromMemberId;
      await ConversationModel.addOrUpdate(
        { userId: message.toMemberId, memberId: message.fromMemberId },
        params
      );
      // const connParams = {
      //   userId: message.toMemberId,
      // };
      // await MessageController.sendMessage(event, message, connParams);
      return resMessage;
    } catch (error) {
      throw error;
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

  static async broadcastMessage(event, connParams, message) {
    try {
      connParams['isBroadcast'] = true;
      await MessageController.sendMessage(event, message, connParams);
      return 'success';
    } catch (error) {
      console.log(error);
    }
  }

  static async addConnection(event, connParams) {
    try {
      await dbConnect();
      await ConnectionModel.addOrUpdate(connParams, connParams);
      const user = await UserModel.getById(connParams.userId);
      await UserModel.update(
        { _id: user._id },
        {
          isOnline: true,
          lastOnlineTime: moment().unix(),
        }
      );
      const message = {
        message: {
          firstName: user['firstName'],
          avatarUrl: user['avatarUrl'],
          awsUserId: user['awsUserId'],
        },
        action: 'userConnected',
      };
      await MessageController.broadcastMessage(event, connParams, message);

      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteConnection(event, connectionId) {
    try {
      await dbConnect();
      const connection = await ConnectionModel.get({
        connectionId: connectionId,
      });
      await ConnectionModel.delete({
        connectionId: connectionId,
      });
      if (connection) {
        const connections = await ConnectionModel.list({
          userId: connection.userId,
        });
        const user = await UserModel.getById(connection.userId);
        const userUpdateParams = {
          isOnline: false,
          lastOnlineTime: moment().unix(),
        };
        if (connections && connections.length > 0) {
          userUpdateParams['isOnline'] = true;
        }
        await UserModel.update({ _id: user._id }, userUpdateParams);
        if (!userUpdateParams['isOnline']) {
          const message = {
            message: {
              firstName: user['firstName'],
              avatarUrl: user['avatarUrl'],
              awsUserId: user['awsUserId'],
            },
            action: 'userDisconnected',
          };
          const connParams = {
            userId: connection.userId,
          };
          await MessageController.broadcastMessage(event, connParams, message);
        }
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async storeMessage(messageParams) {
    try {
      if (messageParams.isGroupMessage) {
        messageParams['tripId'] = messageParams['toMemberId'];
        delete messageParams['toMemberId'];
      }
      const user = await UserModel.getById(messageParams['fromMemberId']);
      const message = await MessageModel.create(messageParams);
      const conversationParams = _.cloneDeep(messageParams);
      if (messageParams['isGroupMessage']) {
        await ConversationModel.addOrUpdate(
          {
            tripId: messageParams['tripId'],
          },
          conversationParams
        );
      } else {
        // 1 to 1 messaging
        delete conversationParams['fromMemberId'];
        delete conversationParams['toMemberId'];
        conversationParams['userId'] = messageParams['toMemberId'];
        conversationParams['memberId'] = messageParams['fromMemberId'];
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
      }
      const resMessage = JSON.parse(JSON.stringify(message));
      resMessage['fromMember'] = user;
      return resMessage;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async sendMessage(event, message, params) {
    const query = {};
    if (params['isBroadcast']) {
      const conversations = await ConversationModel.getAll({
        userId: params['userId'],
      });

      const memberIds = [];
      conversations.map(conversation => {
        memberIds.push(conversation.memberId);
      });
      query['userId'] = { $in: memberIds };
    } else if (
      params['isGroupMessage'] &&
      (params['isGroupMessage'] == true || params['isGroupMessage'] == 'true')
    ) {
      const conversations = await ConversationModel.getAll({
        tripId: params['tripId'],
      });
      const memberIds = [];
      conversations.map(conversation => {
        if (params['fromMemberId'] !== conversation.memberId)
          memberIds.push(conversation.memberId);
      });
      query['userId'] = { $in: memberIds };
    } else {
      query['userId'] = params['toMemberId'];
    }
    const connectionIds = await ConnectionModel.distinctConnections(query);
    if (connectionIds && connectionIds.length > 0) {
      const endpoint =
        event.requestContext.domainName + '/' + event.requestContext.stage;
      const apigwManagement = apigwManagementApi(endpoint);
      const promises = connectionIds.map(connectionId => {
        const msgParams = {
          ConnectionId: connectionId,
          Data: JSON.stringify(message),
        };
        return apigwManagement.postToConnection(msgParams).promise();
      });
      await Promise.all(promises);
    }
    return Promise.resolve();
  }
}
