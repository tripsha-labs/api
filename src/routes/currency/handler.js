/**
 * @name - Currency API Handler
 * @description - This handles API requests
 */
import { successResponse, failureResponse } from '../../utils';
import { CurrencyController } from './currency.ctrl';

/**
 * Get Currency
 */
export const getCurrency = async (req, res) => {
  try {
    // Get search string from queryparams
    const result = await CurrencyController.getCurrency();
    return successResponse(res, result);
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};
