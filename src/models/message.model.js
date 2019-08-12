import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem } from '../utils';
import { base64Decode } from '../helpers';

export class MessageModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.MESSAGES);
  }
  list(queryParams) {
    const params = {
      TableName: this.tableName,
      ExpressionAttributeValues: {
        ':userId': queryParams.userId,
        ':memberId': queryParams.memberId,
        ':groupId': queryParams.groupId,
      },
      KeyConditionExpression: 'groupId=:groupId',
      FilterExpression:
        '(toMemberId=:userId and fromMemberId=:memberId) or (toMemberId=:memberId and fromMemberId=:userId)',
      ScanIndexForward: true,
      Limit: 5000,
      ...base64Decode(queryParams.nextPageToken),
    };
    return queryItem(params);
  }
}
