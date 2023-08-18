import { USDC, USDT, DAI } from '../../../constants/crypto/tokens';
import axios from 'axios';
import { Networks } from '../../../constants/crypto/networks';

export class CoinGeckoClient {
  static async lookupUSD(token) {
    const chainId = token.chainId;
    /**
     * NOTE: If requests exceed a 10/second, you will need a pro API key from Coingecko or
     * find another price source.
     */
    const apiKey = process.env.COINGECKO_KEY;
    let url = 'https://api.coingecko.com/api/v3/simple/token_price/';
    if (apiKey) {
      url = 'https://pro-api.coingecko.com/api/v3/simple/token_price/';
    }

    /**
     * NOTE: this is an assumption that none of these tokens depeg against $1 value. The prices
     * do vary, however, but usually by 1-2 cents. If this is an issue, comment this out and
     * get the actual price from coingecko service.
     */
    if (
      [
        USDC[chainId].address,
        USDT[chainId].address,
        DAI[chainId].address,
      ].includes(token.address)
    ) {
      return 1;
    }
    const addy = token.address.toLowerCase();
    const net = Networks[token.chainId];
    if (!net) {
      throw new Error('Unsupported chain id: ' + token.chainId);
    }
    url = `${url}/${net.geckoId}?contract_addresses=${addy}&vs_currencies=usd`;
    const r = await axios.get(url);

    if (!r || !r.data || !r.data[addy] || !r.data[addy].usd) {
      throw new Error('Could not find USD price for token');
    }

    return r.data[addy].usd || 0;
  }
}
