import { CountryModel } from '../../models';
import { base64Encode } from '../../helpers';

export class CountryController {
  static async listCountries(countryFilter) {
    try {
      const res = await new CountryModel().list(countryFilter);
      const result = {
        data: res.Items,
        count: res.Count,
        ...base64Encode(res.LastEvaluatedKey),
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
