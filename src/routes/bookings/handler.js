/**
 * @name - Bookings handlar
 * @description - This will handle all booking related API requests
 */
import { BookingController } from './booking.ctrl';
import { success, failure, logError } from '../../utils';
import { createBookingValidation } from '../../models';
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
 *  List all bookings created by guest
 */
export const listGuestBookings = async (event, context) => {
  try {
    const result = await BookingController.listGuestBookings(
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    logError(error);
    return failure(error);
  }
};

/**
 *  List all bookings for a given trip ID
 */
export const listHostBookings = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};

    if (!params.tripId) {
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'tripId' };
    }

    const result = await BookingController.listHostBookings(params.tripId);

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
