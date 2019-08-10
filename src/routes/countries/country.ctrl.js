import { CountryModel } from '../../models';

export class CountryController {
  static async listCountries(countryFilter) {
    try {
      const countryModel = new CountryModel();
      const res = await countryModel.list(countryFilter);
      const lastEvaluatedKey =
        res && res.LastEvaluatedKey
          ? {
              nextPageToken: Buffer.from(
                JSON.stringify(res.LastEvaluatedKey)
              ).toString('base64'),
            }
          : {};
      const result = {
        data: res.Items,
        count: res.Count,
        ...lastEvaluatedKey,
      };
      return { error: null, result };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
}
