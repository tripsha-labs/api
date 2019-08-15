import { saveItem, getItem, deleteItem, updateItem } from '../utils';
import { queryBuilder, keyPrefixAlterer } from '../helpers';

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
  update(id, item) {
    const params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: 'SET ' + queryBuilder(item),
      ExpressionAttributeValues: keyPrefixAlterer(item),
      ReturnValues: 'ALL_NEW',
    };
    console.log(params);
    return updateItem(params);
  }

  delete(id) {
    const params = {
      TableName: this.tableName,
      Key: { id },
    };
    return deleteItem(params);
  }

  get(id) {
    const params = {
      TableName: this.tableName,
      Key: { id },
    };
    return getItem(params);
  }
}
