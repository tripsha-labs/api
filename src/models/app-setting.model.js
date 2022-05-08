/**
 * @name - AppSetting model
 * @description - AppSetting DB model.
 */
import { AppSetting } from './app-setting.schema';

export class AppSettingModel {
  static get(params) {
    return AppSetting.findOne(params);
  }
  static addOrUpdate(filter, update) {
    return AppSetting.updateMany(filter, { $set: update }, { upsert: true });
  }
}
