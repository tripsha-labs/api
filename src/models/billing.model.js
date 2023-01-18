/**
 * @name - Invoice model
 * @description - This is the Invoice model. All db operations related to Invoices are performed from here.
 */
import { AppSettingModel } from './app-setting.model';
import { InvoiceItem, Invoice } from './billing.schema';

export class InvoiceItemModel extends InvoiceItem {}

export class InvoiceModel extends Invoice {
  static async findOrInsert(userId) {
    const invoice = await InvoiceModel.findOne({ userId, status: 'draft' });
    if (invoice) return invoice;
    const invoiceNumber = await AppSettingModel.getNextInvoiceNumber();
    console.log('invoiceNumber', invoiceNumber);
    const createInvoice = new InvoiceModel({
      userId,
      invoiceNumber,
    });
    return await createInvoice.save();
  }
}
