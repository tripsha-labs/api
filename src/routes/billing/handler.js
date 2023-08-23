/**
 * @name - Biilings handlar
 * @description - This will handle all billing related API requests
 */
import { Types } from 'mongoose';
import { BillingController } from './billing.ctrl';
import { successResponse, failureResponse } from '../../utils';

/***
 * unbilledPayment
 */
export const unbilledPayment = async (req, res) => {
  try {
    const payload = req?.query || {};
    if (!(payload && payload.organization_id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'organization_id' };
    payload['organization_id'] = Types.ObjectId(payload.organization_id);
    const result = await BillingController.unbilledPayment(
      payload,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const listInvoices = async (req, res) => {
  try {
    const payload = req?.query || {};
    if (!(payload && payload.organization_id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'organization_id' };
    payload['organization_id'] = Types.ObjectId(payload.organization_id);
    const result = await BillingController.listInvoices(
      payload,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const getInvoice = async (req, res) => {
  try {
    const result = await BillingController.getInvoice(
      req.params.id,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
