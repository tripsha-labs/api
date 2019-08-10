import { MemberModel, TriprModel } from '../../models';

export class MemberController {
  static async listMembers(membersFilter) {
    try {
      const memberModel = new MemberModel();
      const res = await memberModel.list(membersFilter);
      // const promises = [];
      // const userModel = new UserModel();
      // res.Items.map(member => {
      //   promises.push(
      //     new Promise(async res => {
      //       const user = await userModel.get(member.memberId);
      //       return res({ ...member, ...user.Item });
      //     })
      //   );
      // });
      // const members = await Promise.all(promises);
      const lastEvaluatedKey =
        res && res.LastEvaluatedKey
          ? {
              nextPageToken: Buffer.from(
                JSON.stringify(res.LastEvaluatedKey)
              ).toString('base64'),
            }
          : {};
      const result = {
        data: res.Items,
        count: res.Count,
        ...lastEvaluatedKey,
      };
      return { error: null, result };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  static async memberAction(params, data) {
    try {
      const tripModel = new TriprModel();
      const memberModel = new MemberModel();
      const res = await tripModel.get(params['tripId']);
      if (!res.Item) return { error: 'TRIP_NOT_FOUND' };
      const promises = [
        data['memberIds'].map(async memberId => {
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
              membershipParams['isFavorite'] = memberDetails.Item['isFavorite'];
              membershipParams['isMember'] = memberDetails.Item['isMember'];
            }
          } catch (error) {
            console.log(error);
          }

          switch (data['action']) {
            case 'addMember':
              if (memberStatus['exists']) {
                return memberModel.updateMember(keyParams, {
                  updatedAt: moment().unix(),
                  isMember: true,
                });
              } else {
                membershipParams['isMember'] = true;
                return memberModel.add(membershipParams);
              }
            case 'makeFavorite':
              if (memberStatus['exists']) {
                return memberModel.updateMember(keyParams, {
                  updatedAt: moment().unix(),
                  isFavorite: true,
                });
              } else {
                membershipParams['isFavorite'] = true;
                return memberModel.add(membershipParams);
              }
            case 'makeUnFavorite':
              if (membershipParams['isMember'] == true) {
                return memberModel.updateMember(keyParams, {
                  updatedAt: moment().unix(),
                  isFavorite: false,
                });
              } else {
                return memberModel.delete(membershipParams);
              }
            case 'removeMember':
              if (membershipParams['isFavorite'] == true) {
                return memberModel.updateMember(keyParams, {
                  updatedAt: moment().unix(),
                  isMember: false,
                });
              } else {
                return memberModel.delete(membershipParams);
              }
            default:
              return Promise.resolve();
          }
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
      return { error: null, result: 'success' };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}
