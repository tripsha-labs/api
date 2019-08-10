import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, scanItem } from '../utils';
import _ from 'lodash';

export class TriprModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.TRIP);
  }
}
