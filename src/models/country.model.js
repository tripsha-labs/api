import _ from 'lodash';
import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem } from '../utils';
import { base64Decode } from '../helpers';
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

    const countryParams = {
      TableName: this.tableName,
      ...expressionAttributeNames,
      ...expressionAttributeValues,
      ScanIndexForward: true,
      Limit: 500,
      ...base64Decode(params.nextPageToken),
    };
    return queryItem(countryParams);
  }
}
