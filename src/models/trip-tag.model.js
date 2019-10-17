/**
 * @name - Trip tags model
 * @description - This is trip -tags model, which handle mamage all trip related interest tags
 */
import { TripTag } from './trip-tag.schema';

export class TripTagModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const tripTags = TripTag.find(filter, select || { name: 1, key: 1 });
    if (sort) tripTags.sort(sort);
    if (pagination) {
      tripTags.limit(pagination.limit);
      tripTags.skip(pagination.skip);
    }
    return tripTags;
  }

  static count(params = {}) {
    return TripTag.countDocuments(params);
  }
}
