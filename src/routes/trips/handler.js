/**
 * @name - Trips handlar
 * @description - This will handle all trip related API requests
 */
import { TripController } from './trip.ctrl';
import { success, failure } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { updateTripValidation, createTripValidation } from '../../models';

/**
 * List trips
 */
export const listTrips = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await TripController.listTrips(
      params,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Create Trip
 */
export const createTrip = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    const errors = createTripValidation(data);
    if (errors != true) throw errors.shift();

    const result = await TripController.createTrip({
      ...data,
      ownerId: event.requestContext.identity.cognitoIdentityId,
    });

    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Update Trip
 */
export const updateTrip = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };
    const errors = updateTripValidation(data);
    if (errors != true) throw errors.shift();

    const result = await TripController.updateTrip(event.pathParameters.id, {
      ...data,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Get Trip
 */
export const getTrip = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.getTrip(
      event.pathParameters.id,
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * Delete Trip
 */
export const deleteTrip = async (event, context) => {
  try {
    if (!(event.pathParameters && event.pathParameters.id))
      throw { ...ERROR_KEYS.MISSING_FIELD, field: 'id' };

    const result = await TripController.deleteTrip(event.pathParameters.id);
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * List my trips
 */
export const myTrips = async (event, context) => {
  try {
    const result = await TripController.myTrips({
      memberId: event.requestContext.identity.cognitoIdentityId,
      isMember: true,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

/**
 * List saved trips
 */
export const savedTrips = async (event, context) => {
  try {
    const result = await TripController.myTrips({
      memberId: event.requestContext.identity.cognitoIdentityId,
      isFavorite: true,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
