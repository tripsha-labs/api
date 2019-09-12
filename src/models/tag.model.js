/**
 * @name - Tag model
 * @description - This is db model for tags
 */
import { Tag } from './tag.schema';

export class TagModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const countries = Tag.find(filter, select || { name: 1 });
    if (sort) countries.sort(sort);
    if (pagination) {
      countries.limit(pagination.limit);
      countries.skip(pagination.skip);
    }
    return countries;
  }

  static count(params = {}) {
    return Tag.countDocuments(params);
  }
}
