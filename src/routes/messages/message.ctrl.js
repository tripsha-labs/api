/**
 * @name - Message Controller
 * @description - This contains business logic for messages module
 */
import https from 'https';
import moment from 'moment';
import jose from 'node-jose';
import _ from 'lodash';
import { dbConnect, apigwManagementApi } from '../../utils';
import { prepareCommonFilter, prepareSortFilter } from '../../helpers';
import { generateAllow } from './helper';
import { UserModel, MessageModel, ConversationModel } from '../../models';
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
                { fromMemberId: user._id },
              ],
            },
            {
              $and: [
                { fromMemberId: filter.memberId },
                { toMemberId: user._id },
              ],
            },
          ],
        };
      }
      console.log(filterParams);
      const params = {
        filter: filterParams,
        ...prepareCommonFilter(filter, ['updatedAt'], 'updatedAt'),
      };

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
        isOnline: 1,
        lastOnlineTime: 1,
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
      };
      const userProjection = {
        'user.avatarUrl': 1,
        'user.awsUserId': 1,
        'user.awsUsername': 1,
        'user.firstName': 1,
        'user.username': 1,
      };
      const ownerProjection = {
        'ownerDetails.avatarUrl': 1,
        'ownerDetails.awsUserId': 1,
        'ownerDetails.awsUsername': 1,
        'ownerDetails.firstName': 1,
        'ownerDetails.username': 1,
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
      await ConversationModel.addOrUpdate({ userId: user._id }, params);
      params['userId'] = message.toMemberId;
      params['memberId'] = user._id;
      await ConversationModel.addOrUpdate(
        { userId: message.toMemberId, memberId: user._id },
        params
      );
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

  static async broadcastMessage(event, user, message) {
    try {
      const params = [
        {
          $match: {
            connectionId: { $exists: true, $ne: null },
            userId: { $ne: user.userId },
          },
        },
      ];
      params.push({
        $group: {
          _id: '$connectionId',
          data: { $last: '$$ROOT' },
        },
      });
      params.push({
        $replaceRoot: {
          newRoot: '$data',
        },
      });
      const members = await ConversationModel.aggregate(params);
      const promises = members.map(member => {
        return MessageController.send(event, member.connectionId, message);
      });
      try {
        await Promise.all(promises);
      } catch (error) {
        console.log('Connection notification failed', error);
      }
      return 'success';
    } catch (error) {
      console.log(error);
    }
  }

  static async addConnection(event, connParams) {
    try {
      await dbConnect();
      const user = await UserModel.getById(connParams.userId);
      const conversations = await ConversationModel.getAll({
        userId: user._id,
      });
      if (conversations && conversations.length > 0) {
        const conversation = conversations[0];
        conversation['connectionIds'] =
          conversation && conversation.connectionIds
            ? conversation.connectionIds
            : [];
        if (conversation.connectionIds.indexOf(connParams.connectionId) == -1)
          conversation.connectionIds.push(connParams.connectionId);
        const params = {
          awsUsername: event.requestContext.authorizer.username,
          isOnline: true,
          connectionIds: conversation.connectionIds,
        };
        await ConversationModel.addOrUpdate({ userId: user._id }, params);
        // const message = {
        //   message: {
        //     'firstName': user['firstName'],
        //     'avatarUrl': user['avatarUrl'],
        //     'awsUserId': user['awsUserId']
        //   },
        //   action: 'userConnected',
        // };
        // await MessageController.broadcastMessage(event, params, message);
      }

      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteConnection(event, connectionId) {
    try {
      await dbConnect();
      const conversation = await ConversationModel.get({
        connectionIds: { $in: connectionId },
      });
      const params = {};
      if (
        conversation &&
        conversation.connectionIds &&
        conversation.connectionIds.length > 0
      ) {
        const index = conversation.connectionIds.indexOf(connectionId);
        if (index !== -1) conversation.connectionIds.splice(index, 1);
        if (conversation.connectionIds.length > 0) {
          params['connectionIds'] = conversation.connectionIds;
        } else {
          params['connectionIds'] = [];
          params['isOnline'] = false;
          params['lastOnlineTime'] = moment().unix();
        }
        await ConversationModel.addOrUpdate(
          { userId: conversation.userId },
          params
        );
        // const message = {
        //   message: conversation,
        //   action: 'userDisconnected',
        // };
        // const memberInfo = {
        //   ...params,
        //   userId: conversation['userId'],
        //   memberId: conversation['memberId'],
        // };
        // await MessageController.broadcastMessage(event, memberInfo, message);
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
      const message = await MessageModel.create(messageParams);
      const conversationParams = {
        message: messageParams.message,
        messageType: 'text',
      };
      if (messageParams['isGroupMessage']) {
        // Group messaging
        conversationParams['tripId'] = messageParams['tripId'];
        await ConversationModel.addOrUpdate(
          {
            tripId: messageParams['tripId'],
          },
          conversationParams
        );
      } else {
        // 1 to 1 messaging
        conversationParams['userId'] = messageParams['toMemberId'];
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
      return message;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async sendMessage(event, message, params) {
    let connectionIds = [];
    console.log(params);
    if (
      params['isGroupMessage'] &&
      (params['isGroupMessage'] == true && params['isGroupMessage'] == 'true')
    ) {
      const conversations = await ConversationModel.getAll({
        tripId: params['tripId'],
      });
      console.log(conversations);
      conversations.map(conversation => {
        connectionIds.concat(conversation.connectionIds);
      });
    } else {
      const conversation = await ConversationModel.get({
        userId: params['toMemberId'],
      });
      connectionIds = conversation.connectionIds || [];
    }
    connectionIds = _.uniq(connectionIds);
    console.log(connectionIds);
    if (connectionIds && connectionIds.length > 0) {
      const promises = [];
      connectionIds.map(async connectionId => {
        promises.push(MessageController.send(event, connectionId, message));
      });

      await Promise.all(promises);
    }
    return Promise.resolve();
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
