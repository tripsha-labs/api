import { TagModel } from '../../models';

export class TagsController {
  static async listTags(tagsFilter) {
    try {
      const tagModel = new TagModel();
      const res = await tagModel.list(tagsFilter);
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
