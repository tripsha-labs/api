/**
 * @name - Asset Controller
 * @description - This will handle all business logic for Asset
 */
import { Types } from 'mongoose';
import { AssetLinkModel, AssetModel, UserModel } from '../../models';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';
import AWS from 'aws-sdk';

export class AssetController {
  static async listAssets(filter, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const searchParams = {
      userId: user._id.toString(),
      isArchived: false,
    };
    if (filter && filter.isArchived) delete searchParams.isArchived;
    if (filter && filter.searchText)
      searchParams['caption'] = {
        $regex: new RegExp(filter.searchText || '', 'i'),
      };
    const params = {
      filter: searchParams,
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
  static async deleteAsset(assetId, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const asset = await AssetModel.getById(assetId);
    if (!asset) throw ERROR_KEYS.ASSET_NOT_FOUND;
    const count = await AssetLinkModel.count({
      asset_id: Types.ObjectId(assetId),
    });
    if (count === 0) {
      // TODO: write delete object from s3
      // const s3 = new AWS.S3();
      // const objectKey = asset.url.replace(
      //   `https://${process.env.BUCKET_NAME}.s3.amazonaws.com`,
      //   ''
      // );
      // const params = { Bucket: process.env.BUCKET_NAME, Key: 'your object' };
      // await s3.deleteObject(params);
      await AssetModel.delete({ _id: Types.ObjectId(assetId) });
    } else if (count > 0) throw ERROR_KEYS.ASSET_DELETE_FAILED;
    return 'success';
  }
}
