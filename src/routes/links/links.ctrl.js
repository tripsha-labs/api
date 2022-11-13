import { Types } from 'mongoose';
import { LinkModel } from '../../models';
export class LinkController {
  static async listLinks(params, user) {
    return await LinkModel.aggregate([
      {
        $match: {
          tripId: Types.ObjectId(params.tripId),
        },
      },
    ]);
  }

  static async createLink(body) {
    return await LinkModel.create(body);
  }

  static async deleteLinks(query) {
    return await LinkModel.deleteMany(query);
  }
  static async updateLink(query, update) {
    return await LinkModel.updateOne(query, update);
  }
}
