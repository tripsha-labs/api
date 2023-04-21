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
          .subtract(60, 'minutes')
          .unix()
    ) {
      const res = await axios.get(
        // 'https://api.freecurrencyapi.com/v1/latest?apikey=8tKkJvUweTIz8Suj4M6gfhUVNhpyWRLy8lBab5Gr&currencies=EUR,GBP,CAD,AUD,MXN,AED'
        'https://openexchangerates.org/api/latest.json',
        { params: { app_id: 'e8ff88c4f2fd450091229975a94cdb56' } }
      );
      const payload = {
        conversions: res?.data?.rates,
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
