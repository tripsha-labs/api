/**
 * @name - country model
 * @description - Mongoose DB model for Country.
 */
import { Country } from './country.schema';

export class CountryModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const countries = Country.find(filter, select || { name: 1, code: 1 });
    if (sort) countries.sort(sort);
    if (pagination) {
      countries.limit(pagination.limit);
      countries.skip(pagination.skip);
    }

    return countries;
  }

  static count(params) {
    return Country.countDocuments((params = {}));
  }
}
