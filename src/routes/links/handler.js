import { LinkController } from './links.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { Types } from 'mongoose';
import { createLinkValidation, updateLinkValidation } from '../../models';
/**
 * List listLinks methods
 */
export const listLinks = async (req, res) => {
  try {
    const params = req.query || {};
    if (!params?.tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    const links = await LinkController.listLinks(params, req.currentUser);
    return successResponse(res, links);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create link methods
 */
export const createLink = async (req, res) => {
  try {
    const body = req.body || {};
    const validation = createLinkValidation(body);
    if (validation != true) throw validation.shift();
    body['updatedBy'] = req.currentUser._id;
    body['createdBy'] = req.currentUser._id;
    await LinkController.createLink(body);
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update link methods
 */
export const updateLink = async (req, res) => {
  try {
    if (!req.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const body = req.body || {};
    const validation = updateLinkValidation(body);
    if (validation != true) throw validation.shift();
    body['updatedBy'] = req.currentUser._id;
    await LinkController.updateLink(
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
 * Delete links methods
 */
export const deleteLinks = async (req, res) => {
  const body = req.body || {};
  if (Array.isArray(body?.resource_ids) && body?.resource_ids?.length == 0)
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'resource_ids' };
  try {
    const linkIds = body?.link_ids.map(id => Types.ObjectId(id));
    await LinkController.deleteLinks({ _id: { $in: linkIds } });
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
