import { PropertiesController } from './properties.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import {
  createPropertiesValidation,
  updatePropertiesValidation,
} from '../../models';
/**
 * List properties methods
 */
export const listProperties = async (req, res) => {
  try {
    const params = req.query || {};
    if (!params?.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const properties = await PropertiesController.list(params);
    return successResponse(res, properties);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create properties methods
 */
export const createProperties = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = createPropertiesValidation(body);
    if (validation != true) throw validation.shift();
    body['tripId'] = Types.ObjectId(body?.tripId);
    body['updatedBy'] = req.currentUser._id;
    body['createdBy'] = req.currentUser._id;
    await PropertiesController.create(body);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete properties methods
 */
export const deleteProperties = async (req, res) => {
  const body = req.body || {};
  if (Array.isArray(body?.property_ids) && body?.property_ids?.length == 0)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'property_ids' };
  try {
    const propertyIds = body?.property_ids.map(id => Types.ObjectId(id));
    await PropertiesController.delete(propertyIds);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update properties methods
 */
export const updateProperties = async (req, res) => {
  try {
    const params = req.query || {};
    if (!params?.propertyId)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'propertyId',
      };
    await PropertiesController.update(propertyId, params);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
