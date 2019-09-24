/**
 * @name - Seeds handlar
 * @description - This will handle seed data population in the database
 */
import { success, failure } from '../../utils';
import { loadCountries, loadProfileTags, loadTripTags } from '../../seeds';
import { dbConnect, dbClose } from '../../utils/db-connect';
export const seeds = async (event, context) => {
  try {
    await dbConnect();
    await loadCountries();
    await loadProfileTags();
    await loadTripTags();
    return success('success');
  } catch (error) {
    console.log(error);
    return failure(error);
  } finally {
    dbClose();
  }
};
