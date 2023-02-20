/**
 * @name - AppSetting model
 * @description - AppSetting DB model.
 */
import moment from 'moment';
import { AppSetting } from './app-setting.schema';

const makeid = length => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};
export class AppSettingModel {
  static get(params) {
    return AppSetting.findOne(params);
  }
  static addOrUpdate(filter, update) {
    return AppSetting.updateMany(filter, { $set: update }, { upsert: true });
  }

  static async getNextInvoiceNumber() {
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let charCodes = {};
    for (let i = 0; i <= 25; i++) {
      charCodes[i + 65] = char[i];
    }
    let uuid = (
      moment().valueOf() -
      moment()
        .startOf('day')
        .valueOf()
    ).toString();
    Object.keys(charCodes).forEach(number => {
      if (typeof value === 'string')
        uuid = uuid.replaceAll(number, charCodes[number]);
    });
    const reqLength = 10 - uuid.length;
    uuid = makeid(reqLength) + uuid;
    const currentDate = moment();
    const monthPart = currentDate.format('YYYY-MM');
    return `${monthPart}-${uuid}`;
  }
}
