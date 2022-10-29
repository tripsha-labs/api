import { Types } from 'mongoose';
import { ResourceCollectionModel, ResourceModel } from '../../models';
export class ResourceController {
  static async listCollections(params, user) {
    return await ResourceCollectionModel.aggregate([
      {
        $match: {
          tripId: Types.ObjectId(params.tripId),
        },
      },
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: 'collectionId',
          as: 'Resources',
        },
      },
    ]);
  }

  static async getCollection(collectionId) {
    return await ResourceCollectionModel.findById(collectionId);
  }

  static async createCollection(body) {
    return await ResourceCollectionModel.create(body);
  }

  static async updateCollection(query, body) {
    return await ResourceCollectionModel.updateOne(query, body);
  }

  static async deleteCollection(query) {
    return await ResourceCollectionModel.deleteOne(query);
  }

  static async createResource(body) {
    return await ResourceModel.create(body);
  }

  static async getResource(id) {
    return await ResourceModel.findById(id);
  }
  static async deleteResources(query) {
    return await ResourceModel.deleteMany(query);
  }
  static async updateResource(query, update) {
    return await ResourceModel.updateOne(query, update);
  }
}
