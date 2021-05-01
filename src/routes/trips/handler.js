/**
 * @name - Trips handlar
 * @description - This will handle all trip related API requests
 */
import { TripController } from './trip.ctrl';
import { success, failure, sendEmail } from '../../utils';
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

    if (typeof data.spotsAvailable === 'undefined') {
      data.spotsAvailable = data.maxGroupSize - 1;
    }

    const errors =
      data.status === 'draft'
        ? updateTripValidation(data)
        : createTripValidation(data);
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
    const result = await TripController.updateTrip(
      event.pathParameters.id,
      {
        ...data,
      },
      event.requestContext.identity.cognitoIdentityId
    );
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

    const result = await TripController.deleteTrip(
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
 * List my trips
 */
export const myTrips = async (event, context) => {
  try {
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await TripController.myTrips({
      ...params,
      awsUserId: event.requestContext.identity.cognitoIdentityId,
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
    const params = event.queryStringParameters
      ? event.queryStringParameters
      : {};
    const result = await TripController.myTrips({
      ...params,
      isPublic: true,
      awsUserId: event.requestContext.identity.cognitoIdentityId,
    });
    return success(result);
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};

export const sendEmails = async (event, context) => {
  const params = event.queryStringParameters ? event.queryStringParameters : {};
  const data = {
    emails: ['madanesanjayraj@gmail.com'],
    name: 'Sunita',
    subject: 'Greetings Sunita',
    message:
      'The host changed an aspect of Blue Marine. Check the trip page to see the new information and let the host know if they no longer work for you.',
  };
  await sendEmail(data);
  console.log(params);
  return success({});
};
