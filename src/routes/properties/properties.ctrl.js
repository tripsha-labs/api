import { Types } from 'mongoose';
import { PropertiesModel } from '../../models';

export class PropertiesController {
  static async list(params) {
    return await PropertiesModel.aggregate([
      {
        $match: {
          tripId: Types.ObjectId(params.tripId),
        },
      },
    ]);
  }
  static async create(body) {
    return await PropertiesModel.create(body);
  }

  static async delete(ids) {
    const objIds = ids?.map(id => Types.ObjectId(id));
    return await PropertiesModel.deleteMany({ _id: { $in: objIds } });
  }

  static async update(id, params) {
    return await PropertiesModel.updateOne(
      { _id: Types.ObjectId(id) },
      { $set: params }
    );
  }
}
