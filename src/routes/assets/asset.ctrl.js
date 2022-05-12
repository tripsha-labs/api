/**
 * @name - Asset Controller
 * @description - This will handle all business logic for Asset
 */
import { Types } from 'mongoose';
import { AssetModel, UserModel, TripModel } from '../../models';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

export class AssetController {
  static async listAssets(filter, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const params = {
      filter: { userId: user._id.toString() },
      ...prepareCommonFilter(filter, ['createdAt']),
    };
    const assets = await AssetModel.list(params);
    return {
      data: assets,
      count: assets.length,
    };
  }
  static async createAsset(params, awsUserId) {
    const user = await UserModel.get({
      awsUserId: awsUserId,
    });
    params['userId'] = user._id.toString();
    return await AssetModel.create(params);
  }
  static async updateAsset(params, assetId) {
    await AssetModel.update({ _id: Types.ObjectId(assetId) }, params);
    return 'success';
  }
  static async deleteAsset(assetId) {
    await AssetModel.delete({ _id: Types.ObjectId(assetId) });
    return 'success';
  }
}
