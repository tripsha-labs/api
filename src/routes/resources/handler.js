import { ResourceController } from './resources.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import {
  createResourceValidation,
  ResourceCollectionModel,
  updateResourceValidation,
  updateResourceCollectionValidation,
  assignResourcesValidation,
} from '../../models';
/**
 * List listResources methods
 */
export const listResources = async (req, res) => {
  try {
    const params = req.query || {};
    if (!params?.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const {
      collections,
      bookingResources,
    } = await ResourceController.listCollections(params, req.currentUser);

    const collectionList = collections.map(collection => {
      collection['Resources'] = collection.Resources.map(resource => {
        const bookingResource = bookingResources.find(
          r => r._id.toString() == resource._id.toString()
        );
        resource['bookings'] = bookingResource?.bookings || [];
        resource['assigned'] = bookingResource?.bookings?.length || 0;
        return resource;
      });
      return collection;
    });
    return successResponse(res, collectionList);
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
    const validation = createResourceValidation(body);
    if (validation != true) throw validation.shift();
    let collection = await ResourceCollectionModel.findOne({
      title: body.collectionName,
    });

    if (!collection) {
      collection = await ResourceCollectionModel.create({
        resourceType: body.resourceType,
        title: body.collectionName,
        tripId: Types.ObjectId(body.tripId),
        addedBy: req.currentUser._id,
        updatedBy: req.currentUser._id,
      });
    }
    delete body['collectionName'];
    const payload = {
      ...body,
      collectionId: collection._id,
      tripId: Types.ObjectId(collection.tripId),
      addedBy: req.currentUser._id,
      updatedBy: req.currentUser._id,
    };
    await ResourceController.createResource(payload);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Get resource methods
 */
export const getResource = async (req, res) => {
  if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
  try {
    const resource = await ResourceController.getResource(req.params.id);
    return successResponse(res, resource);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete resources methods
 */
export const deleteResources = async (req, res) => {
  const body = req.body || {};
  if (Array.isArray(body?.resource_ids) && body?.resource_ids?.length == 0)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'resource_ids' };
  try {
    await ResourceController.deleteResources(body?.resource_ids);
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
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    const validation = updateResourceValidation(body);
    if (validation != true) throw validation.shift();
    let collection = await ResourceCollectionModel.findOne({
      title: body.collectionName,
    });
    if (!collection) {
      collection = await ResourceCollectionModel.create({
        resourceType: body.resourceType,
        title: body.collectionName,
        tripId: Types.ObjectId(body.tripId),
        addedBy: req.currentUser._id,
      });
    }
    body['collectionId'] = collection._id;
    body['updatedBy'] = req.currentUser._id;
    delete body['collectionName'];
    await ResourceController.updateResource(
      {
        _id: Types.ObjectId(req.params.id),
      },
      body
    );
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
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    const validation = updateResourceCollectionValidation(body);
    if (validation != true) throw validation.shift();
    await ResourceCollectionModel.updateOne(
      {
        _id: Types.ObjectId(req.params?.id),
      },
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
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    await ResourceController.deleteCollection({
      _id: Types.ObjectId(req.params?.id),
    });
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Assign resources methods
 */

export const assignResources = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = assignResourcesValidation(body);
    if (validation != true) throw validation.shift();
    await ResourceController.assignResources(body);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Unassign resources methods
 */

export const unassignResources = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = assignResourcesValidation(body);
    if (validation != true) throw validation.shift();
    await ResourceController.unassignResources(body);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
