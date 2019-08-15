import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, scanItem, batchGetItem } from '../utils';
import _ from 'lodash';

export class TripModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.TRIP);
  }
  list(params) {
    const queryParams = {
      TableName: this.tableName,
      Limit: 1000,
      ...params,
    };
    return queryItem(queryParams);
  }

  batchList(keys) {
    const tripParams = {
      RequestItems: {
        [this.tableName]: {
          Keys: keys,
        },
      },
    };

    return batchGetItem(tripParams);
  }
}
