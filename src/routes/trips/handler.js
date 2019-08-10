import { TripController } from './trip.ctrl';
import { success, failure } from '../../utils';
import { errorSanitizer } from '../../helpers';
import { ERROR_CODES } from '../../constants';
import {
  createTripValidation,
  validateTripLength,
  updateTripValidation,
} from '../../models';

/**
 * List trips
 */
export const listTrips = async (event, context) => {
  try {
    const { error, result } = await TripController.listTrips(
      event.queryStringParameters,
      event.requestContext.identity.cognitoIdentityId
    );
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Create Trip
 */
export const createTrip = async (event, context) => {
  const data = JSON.parse(event.body) || {};
  // Validate trip fields against the strict schema
  const errors = createTripValidation(data);
  if (errors != true) {
    return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  }

  const tripLength = validateTripLength(data['startDate'], data['endDate']);
  if (tripLength <= 0 || tripLength > 365 || isNaN(tripLength)) {
    return failure(ERROR_KEYS.INVALID_DATES, ERROR_CODES.VALIDATION_ERROR);
  }
  data['tripLength'] = tripLength;
  try {
    const { error, result } = await TripController.createTrip({
      ...data,
      ownerId: event.requestContext.identity.cognitoIdentityId,
    });
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Update Trip
 */
export const updateTrip = async (event, context) => {
  try {
    const data = JSON.parse(event.body) || {};
    if (!(event.pathParameters && event.pathParameters.id)) {
      return failure(
        { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
        ERROR_CODES.VALIDATION_ERROR
      );
    }
    // Validate trip fields against the strict schema
    const errors = updateTripValidation(data);
    if (errors != true) return failure(errors, ERROR_CODES.VALIDATION_ERROR);

    const { error, result } = await TripController.updateTrip(
      event.pathParameters.id,
      {
        ...data,
      }
    );
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Get Trip
 */
export const getTrip = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  try {
    const { error, result } = await TripController.getTrip(
      event.pathParameters.id,
      event.requestContext.identity.cognitoIdentityId
    );
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

/**
 * Delete Trip
 */
export const deleteTrip = async (event, context) => {
  if (!(event.pathParameters && event.pathParameters.id)) {
    return failure(
      { ...ERROR_KEYS.MISSING_FIELD, field: 'id' },
      ERROR_CODES.VALIDATION_ERROR
    );
  }
  try {
    const { error, result } = await TripController.deleteTrip(
      event.pathParameters.id
    );
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

export const myTrips = async (event, context) => {
  try {
    const { error, result } = await TripController.myTrips(
      event.requestContext.identity.cognitoIdentityId
    );
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

export const savedTrips = async (event, context) => {
  try {
    const { error, result } = await TripController.savedTrips(
      event.requestContext.identity.cognitoIdentityId
    );
    if (error !== null) {
      console.log(error);
      return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
    }
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};