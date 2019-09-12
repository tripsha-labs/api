/**
 * @name - Trip tags model
 * @description - This is trip -tags model, which handle mamage all trip related interest tags
 */
import { Tag } from './tag.schema';

export class TripTagModel {
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
