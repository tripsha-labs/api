/**
 * @name - Asset Controller
 * @description - This will handle all business logic for Asset
 */
import { Types } from 'mongoose';
import { AssetLinkModel, AssetModel, UserModel } from '../../models';
import { prepareCommonFilter } from '../../helpers';
import { ERROR_KEYS } from '../../constants';

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
    if (filter && (filter.imageOnly == true || filter.imageOnly == 'true'))
      searchParams['type'] = {
        $regex: new RegExp(/^image/, 'i'),
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
  static async updateMultiple(params, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    if (
      params.hasOwnProperty('isArchived') &&
      params.hasOwnProperty('asset_ids')
    ) {
      const assetObjectIds = params.asset_ids.map(assetId =>
        Types.ObjectId(assetId)
      );
      console.log(
        await AssetModel.list({ filter: { _id: { $in: assetObjectIds } } })
      );
      await AssetModel.updateMany(
        { _id: { $in: assetObjectIds } },
        { isArchived: params.isArchived }
      );
    }
  }
  static async deleteAsset(assetIds, awsUserId) {
    const user = await UserModel.get({ awsUserId: awsUserId });
    if (!user) throw ERROR_KEYS.USER_NOT_FOUND;
    const assetObjectIds = assetIds.map(assetId => Types.ObjectId(assetId));
    const assets = await AssetModel.list({
      filter: { _id: { $in: assetObjectIds }, userId: user._id.toString() },
    });
    const promises = [];
    if (assets && assets.length > 0) {
      assets.map(async ast => {
        promises.push(
          new Promise(async resolve => {
            const count = await AssetLinkModel.count({
              asset_id: ast._id,
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
              await AssetModel.delete({ _id: ast._id });
            } else {
              await AssetModel.update(
                { _id: ast._id },
                { $set: { isArchived: true } }
              );
            }
            return resolve();
          })
        );
        return ast;
      });
    }
    await Promise.all(promises);
    return 'success';
  }
}
