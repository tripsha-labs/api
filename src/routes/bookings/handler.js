/**
 * @name - Bookings handlar
 * @description - This will handle all booking related API requests
 */
import { BookingController } from './booking.ctrl';
import { successResponse, failureResponse, logError } from '../../utils';
import {
  createBookingValidation,
  hostBookingActionValidation,
  updateBookingValidation,
} from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * Create booking
 */
export const createBooking = async (req, res) => {
  try {
    const data = req.body || {};

    const validation = createBookingValidation(data);
    if (validation != true) throw validation.shift();

    const result = await BookingController.createBooking(
      data,
      req.requestContext.identity.cognitoIdentityId
    );

    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

/**
 *  List all bookings created
 */
export const listBookings = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    let result = [];
    if (params.isHost == true || params.isHost == 'true')
      result = await BookingController.listBookings(
        params,
        req.requestContext.identity.cognitoIdentityId
      );
    else
      result = await BookingController.listGuestBookings(
        params,
        req.requestContext.identity.cognitoIdentityId
      );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 *  Get booking details
 */
export const getBooking = async (req, res) => {
  try {
    const data = req.body || {};
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await BookingController.getBooking(req.params.id);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

/**
 *  Pay part payment
 */
export const doPartPayment = async (req, res) => {
  try {
    const data = req.body || {};
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await BookingController.doPartPayment(
      req.params.id,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

/**
 *  Accept/reject booking
 */
export const bookingsAction = async (req, res) => {
  try {
    const bookingId = req.params && req.params.id;
    if (!bookingId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const data = req.body || {};
    const validation = hostBookingActionValidation(data);
    if (validation != true) throw validation.shift();
    const result = await BookingController.bookingsAction(
      data,
      bookingId,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

/**
 * Update booking
 */
export const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params && req.params.id;
    if (!bookingId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const data = req.body || {};
    const validation = updateBookingValidation(data);
    if (validation != true) throw validation.shift();
    const result = await BookingController.updateBooking(bookingId, data);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
