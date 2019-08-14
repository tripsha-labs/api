import moment from 'moment';
import { MemberModel, TripModel, UserModel } from '../../models';
import { base64Encode } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class MemberController {
  static async listMembers(membersFilter) {
    try {
      const res = await new MemberModel().list(membersFilter);
      const promises = [];
      const userModel = new UserModel();
      res.Items.map(member => {
        promises.push(
          new Promise(async res => {
            const user = await userModel.get(member.memberId);
            return res({ ...member, ...user.Item });
          })
        );
      });
      await Promise.all(promises);
      const result = {
        data: res.Items,
        count: res.Count,
        ...base64Encode(res.LastEvaluatedKey),
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async memberAction(params, data) {
    try {
      const tripModel = new TripModel();
      const memberModel = new MemberModel();
      const res = await tripModel.get(params.tripId);
      if (!res.Item) throw ERROR_KEYS.TRIP_NOT_FOUND;

      const promises = [
        data['memberIds'].map(memberId => {
          return new Promise(async resolve => {
            // Check member already exists of not
            const memberStatus = {
              exists: false,
            };
            const membershipParams = {
              isMember: false,
              isActive: true,
              isArchived: false,
              isFavorite: false,
              updatedAt: moment().unix(),
            };
            const keyParams = {
              memberId: memberId,
              tripId: params['tripId'],
            };
            try {
              const memberDetails = await memberModel.get(keyParams);
              if (memberDetails && memberDetails.Item) {
                memberStatus['exists'] = true;
                membershipParams['isFavorite'] =
                  memberDetails.Item['isFavorite'];
                membershipParams['isMember'] = memberDetails.Item['isMember'];
              }
            } catch (error) {
              console.log(error);
            }
            try {
              switch (data['action']) {
                case 'addMember':
                  if (memberStatus['exists']) {
                    if (membershipParams['isMember']) return resolve('success');
                    await memberModel.update(keyParams, {
                      updatedAt: moment().unix(),
                      isMember: true,
                    });
                  } else {
                    membershipParams['isMember'] = true;
                    membershipParams['memberId'] = memberId;
                    membershipParams['tripId'] = params['tripId'];
                    await memberModel.add(membershipParams);
                  }
                  break;
                case 'makeFavorite':
                  if (memberStatus['exists']) {
                    if (membershipParams['isFavorite'])
                      return resolve('success');
                    await memberModel.update(keyParams, {
                      updatedAt: moment().unix(),
                      isFavorite: true,
                    });
                  } else {
                    membershipParams['isFavorite'] = true;
                    membershipParams['memberId'] = memberId;
                    membershipParams['tripId'] = params['tripId'];
                    await memberModel.add(membershipParams);
                  }
                  break;
                case 'makeUnFavorite':
                  if (membershipParams['isMember'] == true) {
                    await memberModel.update(keyParams, {
                      updatedAt: moment().unix(),
                      isFavorite: false,
                    });
                  } else {
                    await memberModel.delete(keyParams);
                  }
                  break;
                case 'removeMember':
                  if (membershipParams['isFavorite'] == true) {
                    await memberModel.update(keyParams, {
                      updatedAt: moment().unix(),
                      isMember: false,
                    });
                  } else {
                    await memberModel.delete(keyParams);
                  }
                  break;
                default:
                  break;
              }
            } catch (error) {
              console.log(error);
              return resolve('success');
            }
            return resolve('success');
          });
        }),
      ];

      await Promise.all(promises);

      const members = await memberModel.list({ tripId: params['tripId'] });
      if (members && members.Items && members.Items.length > 0) {
        const updateTrip = {
          groupSize: members.Items.length,
          isFull: members.Items.length >= res.Item['maxGroupSize'],
          spotFilledRank: Math.round(
            (members.Items.length / res.Item['maxGroupSize']) * 100
          ),
        };
        await tripModel.update(params['tripId'], updateTrip);
      }
      return 'success';
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
