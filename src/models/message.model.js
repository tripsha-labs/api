import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
import { queryItem, scanItem } from '../utils';
import _ from 'lodash';
export class MessageModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.MESSAGES);
  }
}
