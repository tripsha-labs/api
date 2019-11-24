/**
 * @name - Member controller
 * @description - This will handle business logic for members
 */
import { Types } from 'mongoose';
import _ from 'lodash';
import moment from 'moment';
import {
  MemberModel,
  TripModel,
  ConversationModel,
  UserModel,
  MessageModel,
} from '../../models';
import { dbConnect } from '../../utils';
import { prepareSortFilter } from '../../helpers';
import { APP_CONSTANTS, ERROR_KEYS } from '../../constants';

export class MemberController {
  static async list(filter) {
    try {
      const filterParams = {
        tripId: Types.ObjectId(filter.tripId),
        isMember: true,
      };
      await dbConnect();
      const params = [{ $match: filterParams }];
      params.push({
        $lookup: {
          from: 'users',
          localField: 'memberId',
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
      params.push({
        $project: {
          firstName: 1,
          lastName: 1,
          avatarUrl: 1,
          username: 1,
          updatedAt: 1,
          awsUserId: 1,
        },
      });
      const limit = filter.limit ? parseInt(filter.limit) : APP_CONSTANTS.LIMIT;
      params.push({ $limit: limit });
      const page = filter.page ? parseInt(filter.page) : APP_CONSTANTS.PAGE;
      params.push({ $skip: limit * page });

      const result = await MemberModel.aggregate(params);
      const resultCount = await MemberModel.count(filterParams);
      return {
        data: result,
        count: result.length,
        totalCount: resultCount,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async memberAction(params) {
    try {
      const { memberIds, tripId } = params || { memberIds: [] };
      if (memberIds.length > 0) {
        await dbConnect();
        const user = await UserModel.get({ awsUserId: params['awsUserId'] });
        const objMemberIds = memberIds.map(id => Types.ObjectId(id));
        const objTripId = Types.ObjectId(tripId);
        const trip = await TripModel.getById(objTripId);
        if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;

        const actions = objMemberIds.map(async memberId => {
          const updateParams = {
            memberId,
            tripId: objTripId,
          };
          const memberDetails = await UserModel.getById(memberId.toString());
          const memberExists = await MemberModel.getById(memberId.toString());
          switch (params['action']) {
            case 'addMember':
              updateParams['isMember'] = true;
              updateParams['joinedOn'] = moment().unix();

              if (!memberExists) {
                // conversation update
                const memberAddDetails = {
                  memberId: memberDetails._id.toString(),
                  tripId: trip._id.toString(),
                  joinedOn: moment().unix(),
                  message:
                    memberDetails['firstName'] +
                    ' added by ' +
                    user['firstName'],
                  messageType: 'info',
                  isGroup: true,
                };
                await ConversationModel.addOrUpdate(
                  {
                    tripId: tripId,
                    memberId: memberId.toString(),
                  },
                  memberAddDetails
                );
                const messageParams = {
                  memberId: memberDetails._id.toString(),
                  tripId: trip._id.toString(),
                  message:
                    memberDetails['firstName'] +
                    ' added by ' +
                    user['firstName'],
                  messageType: 'info',
                  isGroupMessage: true,
                  fromMemberId: user._id.toString(),
                };
                await MessageModel.create(messageParams);
              }
              break;
            case 'removeMember':
              updateParams['isMember'] = false;
              updateParams['leftOn'] = moment().unix();
              // conversation update
              if (memberExists) {
                const memberRemoveDetails = {
                  memberId: memberDetails._id.toString(),
                  tripId: trip._id.toString(),
                  leftOn: moment().unix(),
                  message:
                    memberDetails['firstName'] +
                    ' removed by ' +
                    user['firstName'],
                  messageType: 'info',
                  isGroup: true,
                };
                await ConversationModel.addOrUpdate(
                  {
                    tripId: tripId,
                    memberId: memberId.toString(),
                  },
                  memberRemoveDetails
                );
                const messageParams = {
                  memberId: memberDetails._id.toString(),
                  tripId: trip._id.toString(),
                  message:
                    memberDetails['firstName'] +
                    ' removed by ' +
                    user['firstName'],
                  messageType: 'info',
                  isGroupMessage: true,
                  fromMemberId: user._id.toString(),
                };
                await MessageModel.create(messageParams);
              }
              break;
            case 'makeFavorite':
              updateParams['isFavorite'] = true;
              updateParams['favoriteOn'] = moment().unix();
              break;
            case 'makeUnFavorite':
              updateParams['isFavorite'] = false;
              updateParams['unFavoriteOn'] = moment().unix();
              break;
          }
          return MemberModel.update(
            {
              memberId,
              tripId: objTripId,
            },
            updateParams,
            { upsert: true }
          );
        });

        await Promise.all(actions);

        const memberCount = await MemberModel.count({
          tripId: objTripId,
          isMember: true,
        });
        const favoriteCount = await MemberModel.count({
          tripId: objTripId,
          isFavorite: true,
        });
        const updateTrip = {
          groupSize: memberCount,
          isFull: memberCount >= trip['maxGroupSize'],
          favoriteCount: favoriteCount,
          spotFilledRank: Math.round(
            (memberCount / trip['maxGroupSize']) * 100
          ),
        };
        await TripModel.update(objTripId, updateTrip);
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
