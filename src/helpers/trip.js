import { TABLE_NAMES } from '../constants';
import { executeQuery } from '../utils';
import * as moment from 'moment';

export const updateBulkTrip = user => {
  // TODO: Update trips for owner info changed
  if (user) {
  }
  return true;
};

export const getTripMembers = tripId => {
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
