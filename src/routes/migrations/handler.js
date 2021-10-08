/**
 * @name - Migrations handler
 * @description - This will handle migrations API requests
 */
import { success, failure } from '../../utils';
import { dbConnect } from '../../utils';
import {
  updateProfilePic,
  updateTripUrl,
  updateTripStats,
  updateBookingOptions,
} from '../../migrations';

/**
 * runMigrations
 */
export const runMigrations = async (event, context) => {
  try {
    console.log('Running migrations');
    await dbConnect();
    await updateBookingOptions();
    // await updateTripStats();
    // await updateProfilePic();
    // await updateTripUrl();
    console.log('Migrations completed');
    return success('success');
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
