/**
 * @name  - Tags controller
 * @description - This will hadle tags module business logic
 */
import { TagModel } from '../../models';

import { prepareCommonFilter } from '../../helpers';
export class TagsController {
  static async listTags(filter) {
    try {
      const params = {
        filter: {
          name: { $regex: new RegExp('^' + (filter.search || ''), 'i') },
        },
        ...prepareCommonFilter(filter, ['name']),
      };
      const tags = await TagModel.list(params);
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
