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
  createInviteValidation,
  BookingModel,
} from '../../models';
import { ERROR_KEYS } from '../../constants';

/***
 * createInvite
 */
export const createInvite = async (req, res) => {
  try {
    const data = req.body || {};
    const validation = createInviteValidation(data);
    if (validation != true) throw validation.shift();
    const result = await BookingController.createInvite(data, req.currentUser);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
export const removeInvite = async (req, res) => {
  try {
    const data = req.body || {};
    if (data?.booking_id) {
      const result = await BookingController.removeInvite(
        data,
        req.currentUser
      );
      return successResponse(res, result);
    } else
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'booking_id',
      };
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
export const sendCustomEmail = async (req, res) => {
  try {
    const data = req.body || {};
    const result = await BookingController.sendCustomEmailMessage(data);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
export const sendCustomReminderMessage = async (req, res) => {
  try {
    const data = req.body || {};
    const result = await BookingController.sendCustomMessage(
      data,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * Create booking
 */
export const createBooking = async (req, res) => {
  try {
    const data = req.body || {};
    // Validate booking request payload
    const validation = createBookingValidation(data);
    if (validation != true) throw validation.shift();
    // Create booking
    const result = await BookingController.createBooking(data, req.currentUser);
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
      result = await BookingController.listBookings(params, req.currentUser);
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
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await BookingController.doPartPayment(
      req.params.id,
      req.currentUser
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
      req.currentUser
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
    const result = await BookingController.updateBooking(
      bookingId,
      data,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
export const updateGuestFields = async (req, res) => {
  try {
    const bookingId = req.params && req.params.id;
    if (!bookingId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const data = req.body || {};
    const guestId = data.guestId;
    if (!guestId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'guestId' };
    const booking = await BookingModel.getById(bookingId, { guests: 1 });
    if (booking) {
      const guests = booking?.guests?.map(guest => {
        if (guest.id === guestId) {
          guest = { ...guest, ...data.fields };
        }
        return guest;
      });
      await BookingController.updateBooking(bookingId, {
        guests,
      });
    }
    return successResponse(res, 'sucess');
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
export const updateCustomFields = async (req, res) => {
  try {
    const bookingId = req.params && req.params.id;
    if (!bookingId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const data = req.body || {};
    const keys = Object.keys(data);
    let isValid = true;
    keys?.forEach(key => {
      if (!key.includes('customFields.')) isValid = false;
    });
    if (!isValid) {
      throw { ...ERROR_KEYS.BAD_REQUEST };
    }
    const result = await BookingController.updateBooking(bookingId, data);
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
export const multiUpdateBooking = async (req, res) => {
  try {
    const data = req.body || {};
    if (
      data &&
      !data.hasOwnProperty('booking') &&
      !data.hasOwnProperty('unsetFields')
    )
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'booking or unsetFields' };
    if (data && !data.hasOwnProperty('bookingIds'))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'bookingIds' };
    const customFields = data.booking || {};
    const unsetFields = data.unsetFields || [];
    const validation = updateBookingValidation({ customFields });
    if (validation != true) throw validation.shift();
    const keys = Object.keys(customFields);
    const payload = {};
    if (keys && keys.length > 0)
      keys.forEach(key => {
        payload[`customFields.${key}`] = customFields[key];
      });
    const unsetPayload = {};
    if (unsetFields && unsetFields.length > 0)
      unsetFields.forEach(key => {
        unsetPayload[`customFields.${key}`] = 1;
      });
    const result = await BookingController.multiUpdateBooking(
      data.bookingIds,
      payload,
      unsetPayload
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

export const getInvite = async (req, res) => {
  try {
    const reqBody = req.query || {};
    if (!reqBody.inviteToken)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'inviteToken',
      };
    const result = await BookingModel.getById(reqBody.inviteToken, {
      status: 1,
      createdAt: 1,
    });
    if (result) return successResponse(res, result);
    else throw ERROR_KEYS.BOOKING_NOT_FOUND;
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

export const respond = async (req, res) => {
  try {
    const reqBody = req.query || {};
    if (!reqBody.inviteToken)
      throw {
        ...ERROR_KEYS.MISSING_FIELD,
        field: 'inviteToken',
      };
    if (['yes', 'no'].includes(reqBody.response)) {
      const result = await BookingModel.getById(reqBody.inviteToken, {
        status: 1,
        createdAt: 1,
      });

      if (result?.status == 'invited') {
        const data = { status: 'invite-declined' };
        if (reqBody.response === 'yes') data.status = 'invite-accepted';
        await BookingController.updateBooking(reqBody.inviteToken, data);
      }
    }
    return successResponse(res, 'success');
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

export const getInvites = async (req, res) => {
  try {
    const tripId = req.params && req.params.id;
    if (!tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await BookingController.getInvites(
      req.requestContext.identity.cognitoIdentityId,
      tripId
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
export const respondInvite = async (req, res) => {
  try {
    const tripId = req?.params?.id;
    if (!tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const data = req.body || {};
    if (data?.status) {
      const result = await BookingController.respondInvite(
        tripId,
        data,
        req.currentUser
      );

      return successResponse(res, result);
    } else {
      throw ERROR_KEYS.BAD_REQUEST;
    }
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

export const addGuests = async (req, res) => {
  try {
    const tripId = req?.params?.id;
    if (!tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const data = req.body || {};
    const result = await BookingController.addGuests(
      tripId,
      data,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};

export const removeGuests = async (req, res) => {
  try {
    const tripId = req?.params?.id;
    if (!tripId) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const data = req.body || {};
    const result = await BookingController.removeGuests(
      tripId,
      data,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    logError(error);
    return failureResponse(res, error);
  }
};
