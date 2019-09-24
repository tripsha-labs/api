/**
 * @name - Member controller
 * @description - This will handle business logic for members
 */
import { Types } from 'mongoose';
import _ from 'lodash';
import moment from 'moment';
import { MemberModel, TripModel } from '../../models';
import { dbConnect, dbClose } from '../../utils/db-connect';
import { prepareSortFilter } from '../../helpers';
import { APP_CONSTANTS } from '../../constants';

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
    } finally {
      dbClose();
    }
  }

  static async memberAction(params) {
    try {
      await dbConnect();
      if (params['memberIds'] && params['memberIds'].length > 0) {
        params['memberIds'] = params['memberIds'].map(id => Types.ObjectId(id));
        params.tripId = Types.ObjectId(params.tripId);
        const members = await MemberModel.aggregate([
          {
            $match: {
              memberId: { $in: params['memberIds'] },
              tripId: params.tripId,
            },
          },
        ]);

        const memberIds = members.map(member =>
          JSON.stringify(member.memberId)
        );

        const actions = params['memberIds'].map(memberId => {
          const updateParams = {
            memberId: memberId,
            tripId: params.tripId,
          };
          switch (params['action']) {
            case 'addMember':
              updateParams['isMember'] = true;
              updateParams['joinedOn'] = moment().unix();
              break;
            case 'removeMember':
              updateParams['isMember'] = false;
              break;
            case 'makeFavorite':
              updateParams['isFavorite'] = true;
              updateParams['favoriteOn'] = moment().unix();
              break;
            case 'makeUnFavorite':
              updateParams['isFavorite'] = false;
              break;
          }

          return _.indexOf(memberIds, JSON.stringify(memberId)) === -1
            ? MemberModel.create(updateParams)
            : MemberModel.update(
                {
                  memberId: memberId,
                  tripId: params.tripId,
                },
                updateParams
              );
        });

        await Promise.all(actions);
        const trip = await TripModel.getById(params.tripId);
        if (trip) {
          const memberCount = await MemberModel.count({
            tripId: params.tripId,
            isMember: true,
            isActive: true,
          });
          const updateTrip = {
            groupSize: memberCount,
            isFull: memberCount >= trip['maxGroupSize'],
            spotFilledRank: Math.round(
              (memberCount / trip['maxGroupSize']) * 100
            ),
          };
          await TripModel.update(params.tripId, updateTrip);
        }
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }
}
