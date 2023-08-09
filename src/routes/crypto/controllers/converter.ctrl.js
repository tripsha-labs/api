import { ethers } from 'ethers';
import { CoinGeckoClient } from '../services/CoinGeckoClient';
import { findToken } from '../../../constants/crypto/tokens';

export class CryptoPriceConversionController {
  static async convertToUnits(params) {
    const { token, chainId, usd } = params;

    const tokenObj = findToken(chainId, token);
    if (!tokenObj) {
      throw new Error('Could not resolve pay token for chain and address');
    }
    const price = await CoinGeckoClient.lookupUSD(tokenObj);
    const units = usd / price;
    const inUnits = ethers.utils.parseUnits(
      units.toString(),
      tokenObj.decimals
    );
    return BigInt(inUnits);
  }

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
    return errs.length > 0 ? errs : true;
  };
}
