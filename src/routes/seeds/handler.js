/**
 * @name - Seeds handlar
 * @description - This will handle seed data population in the database
 */
import { successResponse, failureResponse } from '../../utils';
import { loadCountries, loadProfileTags, loadTripTags } from '../../seeds';
export const seeds = async (req, res) => {
  try {
    await loadCountries();
    await loadProfileTags();
    await loadTripTags();
    return successResponse(res, 'success');
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
