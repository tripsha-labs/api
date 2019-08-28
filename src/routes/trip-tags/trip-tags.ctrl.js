import { TripTagModel } from '../../models';
import { dbConnect, dbClose } from '../../utils/db-connect';
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
      await dbConnect();
      const tags = await TripTagModel.list(params);
      return {
        data: tags,
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      dbClose();
    }
  }
}
