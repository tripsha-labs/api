/**
 * @name - Bookings handlar
 * @description - This will handle all booking related API requests
 */
import { BookingController } from './booking.ctrl';
import { success, failure, logError } from '../../utils';
import {
  createBookingValidation,
  hostBookingActionValidation,
} from '../../models';
import { ERROR_KEYS } from '../../constants';

/**
 * Create booking
 */
export const createBooking = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};

    const validation = createBookingValidation(data);
    if (validation != true) throw validation.shift();

    const result = await BookingController.createBooking(
      data,
      event.requestContext.identity.cognitoIdentityId
    );

    return success(result);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 *  List all bookings created
 */
export const listBookings = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    let result = [];
    if (params.isHost == true || params.isHost == 'true')
      result = await BookingController.listBookings(
        params,
        event.requestContext.identity.cognitoIdentityId
      );
    else
      result = await BookingController.listGuestBookings(
        event.requestContext.identity.cognitoIdentityId
      );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 *  Get booking details
 */
export const getBooking = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await BookingController.getBooking(event.pathParameters.id);
    return success(result);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 *  Pay part payment
 */
export const doPartPayment = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await BookingController.doPartPayment(
      event.pathParameters.id,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 *  Accept/reject booking
 */
export const bookingsAction = async (event, context) => {
  try {
    const bookingId = event.pathParameters && event.pathParameters.id;
    if (!bookingId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const data = JSON.parse(event.body) || {};
    const validation = hostBookingActionValidation(data);
    if (validation != true) throw validation.shift();
    const result = await BookingController.bookingsAction(
      data,
      bookingId,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 * Update booking
 */
export const updateBooking = async (event, context) => {
  try {
    const bookingId = event.pathParameters && event.pathParameters.id;
    if (!bookingId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const data = JSON.parse(event.body) || {};
    if (validation != true) throw validation.shift();

    const result = await BookingController.updateBooking(bookingId, data);
    return success();
  } catch (error) {
    logError(error);
    return failure(error);
  }
};
