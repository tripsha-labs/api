import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem } from '../utils';
import _ from 'lodash';

export class TagModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.TAGS);
  }
  list(params = {}) {
    const searchText = params && params.search ? params.search : '';
    // Build attribute values
    const expressionAttributeValues =
      searchText != ''
        ? {
            ExpressionAttributeValues: {
              ':nameLower': _.lowerCase(searchText),
              ':pKey': 1,
            },
          }
        : { ExpressionAttributeValues: { ':pKey': 1 } };
    // Build attribute names
    const expressionAttributeNames =
      searchText != ''
        ? {
            ExpressionAttributeNames: {
              '#nameLower': 'nameLower',
              '#pKey': 'pKey',
            },
            KeyConditionExpression:
              '#pKey=:pKey and begins_with(#nameLower, :nameLower)',
          }
        : {
            ExpressionAttributeNames: {
              '#pKey': 'pKey',
            },
            KeyConditionExpression: '#pKey=:pKey',
          };
    // Build nextpage token
    const exclusiveStartKey =
      params && params.nextPageToken
        ? {
            ExclusiveStartKey: JSON.parse(
              Buffer.from(params.nextPageToken, 'base64').toString('ascii')
            ),
          }
        : {};
    const tagsParams = {
      TableName: TABLE_NAMES.TAGS,
      ...expressionAttributeNames,
      ...expressionAttributeValues,
      ScanIndexForward: true,
      Limit: 500,
      ...exclusiveStartKey,
    };
    return queryItem(tagsParams);
  }
}
