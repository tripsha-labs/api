import { Types } from 'mongoose';
import _ from 'lodash';
import { MemberModel, TripModel } from '../../models';
import { dbConnect } from '../../utils/db-connect';
import { prepareCommonFilter } from '../../helpers';

export class MemberController {
  static async list(filter) {
    try {
      const params = {
        filter: {
          tripId: filter.tripId,
          isMember: true,
        },
        ...prepareCommonFilter(filter, ['updatedAt']),
      };
      await dbConnect();
      const result = await MemberModel.list(params);
      const resultCount = await MemberModel.count(params.filter);
      return {
        data: result,
        count: resultCount,
      };
    } catch (error) {
      console.log(error);
      throw error;
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
          const filterParams = {
            memberId: memberId,
            tripId: params.tripId,
          };
          switch (params['action']) {
            case 'addMember':
              filterParams['isMember'] = true;
              break;
            case 'removeMember':
              filterParams['isMember'] = false;
              break;
            case 'makeFavorite':
              filterParams['isFavorite'] = true;
              break;
            case 'makeUnFavorite':
              filterParams['isFavorite'] = false;
              break;
          }

          return _.indexOf(memberIds, JSON.stringify(memberId)) === -1
            ? MemberModel.create(filterParams)
            : MemberModel.update(
                {
                  memberId: memberId,
                  tripId: params.tripId,
                },
                filterParams
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
    }
  }
}
