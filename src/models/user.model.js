import { TABLE_NAMES } from '../constants';
import { BaseModel } from './base.model';
export class UserModel extends BaseModel {
  constructor() {
    super(TABLE_NAMES.USER);
  }
}
