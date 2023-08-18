/**
 * @name - Migrations handler
 * @description - This will handle migrations API requests
 */
import { successResponse, failureResponse } from '../../utils';
import {
  updateProfilePic,
  updateTripUrl,
  updateTripStats,
  updateBookingOptions,
  updateTripsForReservedCount,
  updateVariableNames,
  updateObjectIds,
} from '../../migrations';

/**
 * runMigrations
 */
export const runMigrations = async (req, res) => {
  try {
    console.log('Running migrations');
    // await updateTripStats();
    // await updateProfilePic();
    // await updateTripUrl();
    // await updateBookingOptions();
    // await updateTripsForReservedCount();
    // await updateVariableNames();
    await updateObjectIds();
    console.log('Migrations completed');
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
