import { CryptoPriceConversionController } from './controllers/converter.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { WalletController } from './controllers/wallet.ctrl';

/**
 * Convert USD to token units given the current market price.
 */
export const convertTokenUnits = async (req, res) => {
  try {
    const data = req.body || {};
    const validation = validateTokenAndValue(data);
    if (validation != true) throw validation.shift();

    const units = await CryptoPriceConversionController.convertToUnits({
      chainId: data.chainId,
      token: data.token,
      usd: +data.usd,
    });

    return successResponse(res, { units: units.toString() });
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
  }
};

/**
 * Get the next available signing nonce for a chain/token/wallet
 */
export const getNextSpendAllowanceNonce = async (req, res) => {
  try {
    const data = req.params || {};
    if (!data.chainId) {
      throw new Error('Missing chainId in request');
    }
    if (!data.address) {
      throw new Error('Missing address in request');
    }
    if (!data.token) {
      throw new Error('Missing token address in request');
    }
    const r = await WalletController.getNextSpendAllowanceNonce(data);
    return successResponse(res, { nextNonce: r });
  } catch (e) {
    console.log(e);
    return failureResponse(res, e);
  }
};

const validateTokenAndValue = data => {
  const { chainId, token, usd } = data;
  const errs = [];
  if (!chainId) {
    errs.push(new Error('Missing chainId parameter'));
  }
  if (!token) {
    errs.push(new Error('Missing token parameter'));
  }
  if (!usd) {
    errs.push(new Error('Missing usd parameter'));
  }
  return errs.length > 0 ? errs : true;
};
