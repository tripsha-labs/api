/**
 * @name - Assets API Handler
 * @description - This handles API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { AssetController } from './asset.ctrl';
import {
  assetCreateSchemaValidation,
  assetUpdateSchemaValidation,
} from '../../models';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
/**
 * List assets
 */
export const listAssets = async (req, res) => {
  try {
    // Get search string from queryparams
    const params = req.query ? req.query : {};
    params.organizationId = Types.ObjectId(params?.organizationId);
    const result = await AssetController.listAssets(
      params,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const createAsset = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = assetCreateSchemaValidation(params);
    if (errors != true) throw errors.shift();
    const result = await AssetController.createAsset(
      params,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const updateAsset = async (req, res) => {
  try {
    const params = req.body || {};
    const errors = assetUpdateSchemaValidation(params);
    if (errors != true) throw errors.shift();
    const result = await AssetController.updateAsset(params, req.params.id);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
export const deleteAsset = async (req, res) => {
  try {
    if (!(req.body && req.body.asset_ids))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'asset_ids' };

    const result = await AssetController.deleteAsset(
      req.body.asset_ids,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const updateMultiple = async (req, res) => {
  try {
    if (!(req.body && req.body.asset_ids))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'asset_ids' };

    const result = await AssetController.updateMultiple(
      req.body,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
