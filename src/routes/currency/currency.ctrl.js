/**
 * @name - Currency Controller
 * @description - This will handle all business logic for Currency
 */

import { CurrencyModel } from '../../models';
import moment from 'moment';
import axios from 'axios';

export class CurrencyController {
  static async getCurrency() {
    let currency = await CurrencyModel.findOne({});
    if (!currency) currency = { currency: 'USD' };
    if (
      !currency?.lastUpdatedTime ||
      currency?.lastUpdatedTime <
        moment()
          .subtract(10, 'minutes')
          .unix()
    ) {
      const res = await axios.get(
        'https://api.freecurrencyapi.com/v1/latest?apikey=8tKkJvUweTIz8Suj4M6gfhUVNhpyWRLy8lBab5Gr&currencies=EUR,GBP,CAD,AUD,MXN'
      );
      const payload = {
        conversions: res?.data?.data,
        lastUpdatedTime: moment().unix(),
        currency: 'USD',
      };
      await CurrencyModel.updateOne(
        { currency: 'USD' },
        { $set: payload },
        { upsert: true }
      );
      currency = payload;
    }
    return currency;
    return '';
  }
}
