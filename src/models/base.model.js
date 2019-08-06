import { saveItem } from '../utils';
export class BaseModel {
  tableName = null;
  constructor(tableName) {
    this.tableName = tableName;
  }
  add(item) {
    const params = {
      TableName: this.tableName,
      Item: item,
    };
    return saveItem(params);
  }
  // update(item) {}

  // delete(id) {}

  // get(id) {}

  // list() {}
}
