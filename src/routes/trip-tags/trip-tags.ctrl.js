/**
 * @name -Trip tags controller
 * @description - This will handle trip tags business logic
 */
import { TripTagModel } from '../../models';
import { prepareCommonFilter } from '../../helpers';

export class TripTagsController {
  static async listTags(filter) {
    try {
      const params = {
        filter: {
          name: { $regex: new RegExp('^' + (filter.search || ''), 'i') },
        },
        ...prepareCommonFilter(filter, ['name']),
      };
      const tags = await TripTagModel.list(params);
      return {
        data: tags,
        count: tags.length,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
