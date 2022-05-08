/**
 * @name - AssetModel model
 * @description - AssetModel DB model.
 */
import { Asset } from '.';

export class AssetModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const assets = Asset.find(filter, select || {});
    if (sort) hosts.sort(sort);
    if (pagination) {
      assets.limit(pagination.limit);
      assets.skip(pagination.skip);
    }
    return assets;
  }

  static count(params = {}) {
    return Asset.countDocuments(params);
  }

  static create(params = {}) {
    const asset = new Asset(params);
    return asset.save();
  }

  static update(filter, params = {}, upsert = { upsert: false }) {
    return Asset.updateOne(filter, { $set: params }, upsert);
  }

  static delete(params = {}) {
    return Asset.deleteOne(params);
  }

  static getById(id) {
    return Asset.findById(id);
  }

  static get(params, select) {
    return Asset.findOne(params, select || {});
  }
}
