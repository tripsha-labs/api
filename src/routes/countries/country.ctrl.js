import { CountryModel } from '../../models';
import { dbConnect } from '../../utils/db-connect';
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
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
