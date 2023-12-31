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
  createProjectValidation,
  TripModel,
  editProjectValidation,
} from '../../models';
import moment from 'moment';

/**
 * List traveler trips
 */
export const listTrips = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    const result = await TripController.listTrips(params);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create project
 */
export const createProject = async (req, res) => {
  try {
    const data = req.body || {};
    const errors = createProjectValidation(data);
    if (errors != true) throw errors.shift();
    const payload = { name: data.name };
    payload['ownerId'] = req.currentUser._id;
    payload['updatedBy'] = req.currentUser._id;
    const result = await TripController.createProject(payload, data);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

export const editProject = async (req, res) => {
  try {
    const data = req.body || {};
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const errors = editProjectValidation(data);
    if (errors != true) throw errors.shift();
    data['updatedBy'] = req.currentUser._id;
    const result = await TripController.editProject(req.params.id, data);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Create Trip
 */
// export const createTrip = async (req, res) => {
//   try {
//     const data = req.body || {};

//     if (typeof data.spotsAvailable === 'undefined') {
//       data.spotsAvailable = data.maxGroupSize - 1;
//     }

//     const errors =
//       data.status === 'draft'
//         ? draftTripValidation(data)
//         : createTripValidation(data);
//     if (errors != true) throw errors.shift();

//     const result = await TripController.createTrip({
//       ...data,
//       ownerId: req.requestContext.identity.cognitoIdentityId,
//     });

//     return successResponse(res, result);
//   } catch (error) {
//     console.log(error);
//     return failureResponse(res, error);
//   }
// };

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
 * Update Draft Trip
 */
export const updateDraftTrip = async (req, res) => {
  try {
    const data = req.body || {};
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const errors = draftTripValidation(data);
    if (errors != true) throw errors.shift();
    const result = await TripController.updateDraftTrip(
      req.params.id,
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
 * Publish trip page
 */
export const publishTrip = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const trip = await TripModel.getById(req.params.id);
    const payload = trip.draft;
    const errors = updateTripValidation(payload);
    if (errors != true) throw errors.shift();
    const tripLength = payload?.tripLength || 0;
    if (payload.startDate) {
      payload['endDate'] = moment(payload.startDate, 'YYYYMMDD')
        .add(tripLength, 'days')
        .format('YYYYMMDD');
    }
    const result = await TripController.publishTrip(
      req.params.id,
      payload,
      req.currentUser
    );
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
/**
 * Unpublish trip page
 */
export const unPublishTrip = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const result = await TripController.unPublishTrip(
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
 * Canccel Trip
 */
export const cancelTrip = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.cancelTrip(
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
 * Restore Trip
 */
export const restoreTrip = async (req, res) => {
  try {
    if (!(req.params && req.params.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.restoreTrip(
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
 * List travelers trips
 */
export const myTrips = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    const result = await TripController.myTrips(params, req.currentUser);
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * List host permitted trips
 */
export const activeTrips = async (req, res) => {
  try {
    const params = req.query ? req.query : {};
    const result = await TripController.activeTrips(params, req.currentUser);
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
