/**
 * @name - Country Controller
 * @description - This will handle all business logic for country
 */
import { CountryModel } from '../../models';
import { dbConnect, dbClose } from '../../utils/db-connect';
import { prepareCommonFilter } from '../../helpers';

export class CountryController {
  static async listCountries(filter) {
    try {
      const params = {
        filter: {
          name: { $regex: new RegExp('^' + (filter.search || ''), 'i') },
        },
        ...prepareCommonFilter(filter, ['name']),
      };
      await dbConnect();
      const countries = await CountryModel.list(params);
      return {
        data: countries,
        count: countries.length,
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }
}
