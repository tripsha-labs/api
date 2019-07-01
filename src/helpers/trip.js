import { TABLE_NAMES } from '../constants';
import { executeQuery } from '../utils';
import * as moment from 'moment';

export const updateBulkTrip = user => {
  // TODO: Update trips for owner info changed
  if (user) {
  }
  return true;
};

export const getTripMembers = async tripId => {
  const getMemberList = {
    TableName: TABLE_NAMES.MEMBERS,
    IndexName: 'tripMembers',
    ScanIndexForward: true,
    Limit: 1000,
    ExpressionAttributeNames: {
      '#tripId': 'tripId',
      '#isMember': 'isMember',
    },
    KeyConditionExpression: '#tripId=:tripId',
    ExpressionAttributeValues: { ':tripId': tripId, ':isMember': true },
    FilterExpression: '#isMember=:isMember',
  };
  try {
    const members = await executeQuery('query', getMemberList);
    const promises = [];
    members.Items.map(member => {
      promises.push(
        new Promise(async res => {
          const params = {
            TableName: TABLE_NAMES.USER,
            Key: {
              id: member.memberId,
            },
          };
          const user = await executeQuery('get', params);
          return res({ ...member, ...user.Item });
        })
      );
    });
    return Promise.all(promises);
  } catch (error) {
    console.log(error);
    return Promise.all([]);
  }
};

export const getMyTrips = memberId => {
  const getMemberList = {
    TableName: TABLE_NAMES.MEMBERS,
    ScanIndexForward: true,
    Limit: 1000,
    ExpressionAttributeNames: {
      '#memberId': 'memberId',
      '#isActive': 'isActive',
    },
    KeyConditionExpression: '#memberId=:memberId',
    ExpressionAttributeValues: { ':memberId': memberId, ':isActive': true },
    FilterExpression: '#isActive=:isActive',
  };

  return executeQuery('query', getMemberList);
};

export const getSavedTrips = memberId => {
  const getMemberList = {
    TableName: TABLE_NAMES.MEMBERS,
    ScanIndexForward: true,
    Limit: 1000,
    ExpressionAttributeNames: {
      '#memberId': 'memberId',
      '#isFavorite': 'isFavorite',
    },
    KeyConditionExpression: '#memberId=:memberId',
    ExpressionAttributeValues: { ':memberId': memberId, ':isFavorite': true },
    FilterExpression: '#isFavorite=:isFavorite',
  };

  return executeQuery('query', getMemberList);
};

export const addMember = (tripId, memberId) => {
  const addMemberItem = {
    TableName: TABLE_NAMES.MEMBERS,
    Item: {
      memberId: memberId,
      tripId: tripId,
      isActive: true,
      isOwner: true,
      isMember: true,
      isFavorite: false,
      updatedAt: moment().unix(),
    },
    ReturnValues: 'ALL_OLD',
  };

  return executeQuery('put', addMemberItem);
};
