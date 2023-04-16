/**
 * @name - Trips handlar
 * @description - This will handle all trip related API requests
 */
import { TripController } from './trip.ctrl';
import { successResponse, failureResponse, sendEmail } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import {
  updateTripValidation,
  createTripValidation,
  draftTripValidation,
} from '../../models';

/**
 * List trips
 */
export const listTrips = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    const result = await TripController.listTrips(
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
 * Create Trip
 */
export const createTrip = async (req, res) => {
  try {
    const data = req.body || {};

    if (typeof data.spotsAvailable === 'undefined') {
      data.spotsAvailable = data.maxGroupSize - 1;
    }

    const errors =
      data.status === 'draft'
        ? draftTripValidation(data)
        : createTripValidation(data);
    if (errors != true) throw errors.shift();

    const result = await TripController.createTrip({
      ...data,
      ownerId: req.requestContext.identity.cognitoIdentityId,
    });

    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Update Trip
 */
export const updateTrip = async (req, res) => {
  try {
    const data = req.body || {};
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const errors =
      data.status === 'draft'
        ? draftTripValidation(data)
        : updateTripValidation(data);
    if (errors != true) throw errors.shift();
    const result = await TripController.updateTrip(
      req.params.id,
      {
        ...data,
      },
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Get Trip
 */
export const getTrip = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.getTrip(
      req.params.id,
      req.requestContext.identity.cognitoIdentityId,
      req.currentUser,
      req.query?.includeStat,
      req.query?.includePermissions
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete Trip
 */
export const deleteTrip = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.deleteTrip(
      req.params.id,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * List my trips
 */
export const myTrips = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    let result = null;
    if (params.isHost || params.status === 'draft')
      result = await TripController.myActiveTrips(params, req.currentUser);
    else result = await TripController.myTrips(params, req.currentUser);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * List saved trips
 */
export const savedTrips = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    const result = await TripController.myTrips({
      ...params,
      isPublic: true,
      awsUserId: req.requestContext.identity.cognitoIdentityId,
    });
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const sendEmails = async (req, res) => {
  const params = req.query ? req.query : {};
  const data = {
    emails: ['madanesanjayraj@gmail.com'],
    name: 'Sanjay',
    subject: 'Greetings Sanjay',
    message:
      'The host changed an aspect of Blue Marine. Check the trip page to see the new information and let the host know if they no longer work for you.',
  };
  await sendEmail(data);
  return successResponse(res, {});
};

/**
 * List trip members
 */
export const listMembers = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    // Get search string from queryparams
    const queryParams = req.query || {};

    const params = {
      tripId: req.params.id,
      ...queryParams,
    };

    const result = await TripController.listMembers(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Trip bookings
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const tripBookings = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.tripBookings(
      req.params.id,
      req.requestContext.identity.cognitoIdentityId
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Transfer host
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const transferHost = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.transferHost(
      req.params.id,
      req.body,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Add co host
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const addCoHost = async (req, res) => {
  try {
    if (!req?.params?.id) throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    if (!req?.body?.email)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'email' };

    const result = await TripController.addCoHost(
      req.params.id,
      req?.body,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Delete co host
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const deleteCoHost = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    if (!req?.body?.hostId)
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'hostId' };
    const result = await TripController.deleteCoHost(
      req.params.id,
      req.body.hostId,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * list co hosts
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const getCoHosts = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.getCoHosts(
      req.params.id,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * list invited trips
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const invitedTrips = async (req, res) => {
  try {
    const result = await TripController.getInviteList(req.currentUser);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
