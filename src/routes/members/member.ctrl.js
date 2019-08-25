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
        const bulkOps = params['memberIds'].map(memberId => {
          const ops = {
            updateOne: {
              filter: {
                memberId: memberId,
                tripId: params.tripId,
              },
              update: {
                memberId: memberId,
                tripId: params.tripId,
              },
              upsert: true,
            },
          };
          switch (params['action']) {
            case 'addMember':
              ops['updateOne']['update']['isMember'] = true;
              break;
            case 'removeMember':
              ops['updateOne']['update']['isMember'] = false;
              break;
            case 'makeFavorite':
              ops['updateOne']['update']['isFavorite'] = true;
              break;
            case 'makeUnFavorite':
              ops['updateOne']['update']['isFavorite'] = false;
              break;
          }
          return ops;
        });
        await MemberModel.bulkUpdate(bulkOps);
        const memberCount = await MemberModel.count({ tripId: params.tripId });
        const updateTrip = {
          groupSize: memberCount,
          isFull: memberCount >= res.Item['maxGroupSize'],
          spotFilledRank: Math.round(
            (memberCount / res.Item['maxGroupSize']) * 100
          ),
        };
        await TripModel.update(params.tripId, updateTrip);
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
