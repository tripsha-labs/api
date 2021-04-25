/**
 * @name - Migrations handler
 * @description - This will handle migrations API requests
 */
import { success, failure } from '../../utils';
import { updateProfilePic, updateTripUrl } from '../../migrations';

/**
 * runMigrations
 */
export const runMigrations = async (event, context) => {
  try {
    // await updateProfilePic();
    await updateTripUrl();
    return success('success');
  } catch (error) {
    console.log(error);
    return failure(error);
  }
};
