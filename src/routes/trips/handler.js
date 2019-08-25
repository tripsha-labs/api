import { TripController } from './trip.ctrl';
import { success, failure } from '../../utils';
import { ERROR_KEYS } from '../../constants';

/**
 * List trips
 */
export const listTrips = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await TripController.listTrips(params);
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
    // Validate trip fields against the strict schema
    const tripLength = validateTripLength(data['startDate'], data['endDate']);
    if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength))
      throw ERROR_KEYS.INVALID_DATES;

    data['tripLength'] = tripLength;

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
    const result = await TripController.myTrips(
      event.requestContext.identity.cognitoIdentityId
    );
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
    const result = await TripController.savedTrips(
      event.requestContext.identity.cognitoIdentityId
    );
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
