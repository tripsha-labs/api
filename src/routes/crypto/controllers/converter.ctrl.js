import { ethers } from 'ethers';
import { CoinGeckoClient } from '../services/CoinGeckoClient';
import { findToken } from '../../../constants/crypto/tokens';
import { Goerli } from '../../../constants/crypto/networks';

/**
 * Conversion controller that uses Coingecko service to convert USD units to token units
 */
export class CryptoPriceConversionController {
  /**
   * Convert usd to token units
   */
  static async convertToUnits(params) {
    const { token, chainId, usd } = params;
    const errs = CryptoPriceConversionController.validateTokenAndValue(params);
    if (errs && errs.length > 0) {
      throw errs.shift();
    }

    const tokenObj = findToken(chainId, token);
    if (!tokenObj) {
      throw new Error('Could not resolve pay token for chain and address');
    }

    const price =
      chainId === Goerli.chainId
        ? 1
        : await CoinGeckoClient.lookupUSD(tokenObj);
    const units = usd / price;

    //use ethers to convert to token units based on current spot price
    const inUnits = ethers.utils.parseUnits(
      units.toString(),
      tokenObj.decimals
    );
    return BigInt(inUnits.toString());
  }

  /**
   * Validate the parameters for conversion
   */
  static validateTokenAndValue = data => {
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
    return errs.length > 0 ? errs : false;
  };
}
