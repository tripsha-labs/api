import { CryptoPriceConversionController } from './controllers/converter.ctrl';
import { successResponse } from '../../utils';

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

    return successResponse(res, { units });
  } catch (error) {
    console.log(error);
    return failureResponse(res, error);
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
