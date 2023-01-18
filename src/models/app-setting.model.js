/**
 * @name - AppSetting model
 * @description - AppSetting DB model.
 */
import moment from 'moment';
import { InvoiceNumber } from 'invoice-number';
import { AppSetting } from './app-setting.schema';

export class AppSettingModel {
  static get(params) {
    return AppSetting.findOne(params);
  }
  static addOrUpdate(filter, update) {
    return AppSetting.updateMany(filter, { $set: update }, { upsert: true });
  }
  static async getNextInvoiceNumber() {
    const currentDate = moment();
    const monthPart = currentDate.format('YYYY/MM');
    const invoiceNumber = AppSetting.findOne({ name: 'invoiceNumber' });
    let counter = 'AAA000';
    if (invoiceNumber?.counter) {
      const counterArray = invoiceNumber.counter?.split('/');
      counter = counterArray.pop();
      if (counterArray.join('/') !== monthPart) counter = 'AAA000';
    }
    let newCounter = InvoiceNumber.next(counter);
    const newInvoiceNumber = `${monthPart}/${newCounter}`;
    await AppSettingModel.addOrUpdate(
      { name: 'invoiceNumber' },
      { name: 'invoiceNumber', counter: newInvoiceNumber }
    );
    return newInvoiceNumber;
  }
}
