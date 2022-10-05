/**
 * @name - AssetLinkModel model
 * @description - AssetLinkModel DB model.
 */
import { AssetLink } from '.';

export class AssetLinkModel {
  static list(params = {}) {
    const { filter, select, pagination, sort } = params;
    const assetLinks = AssetLink.find(filter, select || {});
    if (sort) assetLinks.sort(sort);
    if (pagination) {
      assetLinks.limit(pagination.limit);
      assetLinks.skip(pagination.skip);
    }
    return assetLinks;
  }

  static count(params = {}) {
    return AssetLink.countDocuments(params);
  }

  static create(params = {}) {
    const asset = new AssetLink(params);
    return asset.save();
  }

  static update(filter, params = {}, upsert = { upsert: false }) {
    return AssetLink.updateOne(filter, { $set: params }, upsert);
  }

  static delete(params = {}) {
    return AssetLink.deleteOne(params);
  }

  static getById(id) {
    return AssetLink.findById(id);
  }

  static get(params, select) {
    return AssetLink.findOne(params, select || {});
  }
  static insertMany(params) {
    return AssetLink.insertMany(params);
  }
  static deleteMany(params) {
    return AssetLink.deleteMany(params);
  }
}
