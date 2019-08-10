import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem } from '../utils';
import _ from 'lodash';

export class CountryModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.COUNTRIES);
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
            KeyConditionExpression:
              '#pKey=:pKey and begins_with(#nameLower, :nameLower)',
            ExpressionAttributeNames: {
              '#nameLower': 'nameLower',
              '#pKey': 'pKey',
            },
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
    const countryParams = {
      TableName: this.tableName,
      ...expressionAttributeNames,
      ...expressionAttributeValues,
      ScanIndexForward: true,
      Limit: 500,
      ...exclusiveStartKey,
    };
    return queryItem(countryParams);
  }
}
