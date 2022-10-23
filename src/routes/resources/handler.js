import { ResourceController } from './resources.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import {
  createResourceCollectionValidation,
  createResourceValidation,
  ResourceCollectionModel,
  TripModel,
  updateResourceCollectionValidation,
  updateResourceValidation,
} from '../../models';
/**
 * List collections methods
 */
export const listCollections = async (req, res) => {
  try {
    const params = req.query || {};
    if (!params?.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const collections = await ResourceController.listCollections(
      params,
      req.currentUser
    );
    return successResponse(res, collections);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * Get collection methods
 */
export const getCollection = async (req, res) => {
  try {
    if (!req.params?.collectionId)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'collectionId' };
    const collection = await ResourceController.getCollection(
      req.params.collectionId
    );
    if (!collection) throw ERROR_KEYS.COLLECTION_NOT_FOUND;
    return successResponse(res, collection);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create collection methods
 */
export const createCollection = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = createResourceCollectionValidation(body);
    if (validation != true) throw validation.shift();
    body['addedBy'] = req.currentUser._id.toString();
    const trip = await TripModel.getById(body.tripId);
    if (!trip) throw ERROR_KEYS.TRIP_NOT_FOUND;
    body['tripId'] = trip._id;
    await ResourceController.createCollection(body);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update collection methods
 */
export const updateCollection = async (req, res) => {
  try {
    if (!req.params?.collectionId)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'collectionId' };
    const body = req.body || {};
    const validation = updateResourceCollectionValidation(body);
    if (validation != true) throw validation.shift();
    await ResourceController.updateCollection(
      { _id: Types.ObjectId(req.params?.collectionId) },
      body
    );
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete collection methods
 */
export const deleteCollection = async (req, res) => {
  if (!req.params?.collectionId)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'collectionId' };
  try {
    await ResourceController.deleteCollection({
      _id: Types.ObjectId(req.params?.collectionId),
    });
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create resource methods
 */
export const createResource = async (req, res) => {
  try {
    const body = req.body || {};
    if (!req.params?.collectionId)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'collectionId' };
    const validation = createResourceValidation(body);
    if (validation != true) throw validation.shift();
    const collection = await ResourceCollectionModel.findById(
      req.params?.collectionId
    );
    if (!collection) throw ERROR_KEYS.COLLECTION_NOT_FOUND;
    const payload = {
      ...req.body,
      collectionId: collection._id,
      tripId: collection.tripId,
      addedBy: req.currentUser._id,
    };
    await ResourceController.createResource(payload);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Get resources methods
 */
export const getResources = async (req, res) => {
  if (!req.params?.collectionId)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'collectionId' };
  try {
    const resource = await ResourceController.getResources(
      req.params.collectionId
    );
    return successResponse(res, resource);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete resource methods
 */
export const deleteResource = async (req, res) => {
  if (!req.params?.resourceId)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'resourceId' };
  try {
    await ResourceController.deleteResource({
      _id: Types.ObjectId(req.params.resourceId),
    });
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update resource methods
 */
export const updateResource = async (req, res) => {
  try {
    if (!req.params?.resourceId)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'resourceId' };
    const body = req.body || {};
    const validation = updateResourceValidation(body);
    if (validation != true) throw validation.shift();
    await ResourceController.updateResource(
      {
        _id: Types.ObjectId(req.params.resourceId),
      },
      body
    );
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
