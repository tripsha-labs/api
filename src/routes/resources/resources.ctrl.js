import { Types } from 'mongoose';
import {
  BookingResource,
  ResourceCollectionModel,
  ResourceModel,
} from '../../models';
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
  static async assignResources(payload) {
    const query = [];
    payload.bookings.forEach(a => {
      payload.resources.forEach(r => {
        query.push({
          updateOne: {
            filter: {
              tripId: Types.ObjectId(payload.tripId),
              resourceId: Types.ObjectId(r),
              bookingId: Types.ObjectId(a),
            },
            update: {
              $set: {
                tripId: Types.ObjectId(payload.tripId),
                resourceId: Types.ObjectId(r),
                bookingId: Types.ObjectId(a),
              },
            },
            upsert: true,
          },
        });
      });
    });
    await BookingResource.bulkWrite(query);
    const resourceIds = payload.resources.map(r => Types.ObjectId(r));

    let bookingResources = await BookingResource.aggregate([
      {
        $match: {
          resourceId: { $in: resourceIds },
        },
      },
      {
        $group: {
          _id: '$resourceId',
          count: { $sum: 1 },
        },
      },
    ]);
    bookingResources = bookingResources?.map(ra => {
      return {
        updateOne: {
          filter: {
            _id: ra._id,
          },
          update: {
            $set: {
              assigned: ra.count,
            },
          },
        },
      };
    });
    return await ResourceModel.bulkWrite(bookingResources);
  }
}
