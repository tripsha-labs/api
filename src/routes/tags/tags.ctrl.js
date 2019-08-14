import { TagModel } from '../../models';
import { base64Encode } from '../../helpers';

export class TagsController {
  static async listTags(tagsFilter) {
    try {
      const tagModel = new TagModel();
      const res = await tagModel.list(tagsFilter);
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
