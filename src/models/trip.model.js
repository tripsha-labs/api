import { Trip } from './';

export class TripModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const trips = Trip.find(filter, select || {});
    if (sort) trips.sort(sort);
    if (pagination) {
      trips.limit(pagination.limit);
      trips.skip(pagination.skip);
    }
    return trips;
  }

  static aggregate(params = {}) {
    return Trip.aggregate(params);
  }

  static savedTrips(params = {}) {
    const { filter, select, pagination, sort } = params;
    const trips = Trip.find(filter, select || {});
    if (sort) trips.sort(sort);
    if (pagination) {
      trips.limit(pagination.limit);
      trips.skip(pagination.skip);
    }
    return trips;
  }

  static count(params = {}) {
    return Trip.count(params);
  }

  static create(params = {}) {
    const trip = new Trip(params);
    return trip.save();
  }

  static update(id, params = {}) {
    return Trip.updateOne({ _id: id }, { $set: params });
  }

  static delete(params = {}) {
    return Trip.deleteOne(params);
  }

  static getById(id) {
    return Trip.findById(id);
  }
  static get(params) {
    return Trip.findOne(params).populate('User');
  }
}
