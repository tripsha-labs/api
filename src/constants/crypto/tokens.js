import {
  Arbitrum,
  EthereumMainnet,
  Goerli,
  Networks,
  Optimism,
  Polygon,
} from './networks';

/**
 * This is the set of all tokens Tripsha can support on each network. Additionally, wrapped native
 * assets are supported. See networks.js
 */

const BASE_USDC = {
  decimals: 6,
  symbol: 'USDC',
};

const BASE_USDT = {
  decimals: 6,
  symbol: 'USDT',
};

const BASE_DAI = {
  decimals: 18,
  symbol: 'DAI',
};

const BASE_WETH = {
  decimals: 18,
  symbol: 'WETH',
};

export const WETH = {
  [EthereumMainnet.chainId]: {
    ...BASE_WETH,
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    chainId: EthereumMainnet.chainId,
  },
  [Polygon.chainId]: {
    ...BASE_WETH,
    address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    chainId: Polygon.chainId,
  },
  [Optimism.chainId]: {
    ...BASE_WETH,
    address: '0x4200000000000000000000000000000000000006',
    chainId: Optimism.chainId,
  },
  [Arbitrum.chainId]: {
    ...BASE_WETH,
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    chainId: Arbitrum.chainId,
  },
  [Goerli.chainId]: {
    ...BASE_WETH,
    address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
    chainId: Goerli.chainId,
  },
};

export const USDC = {
  [EthereumMainnet.chainId]: {
    ...BASE_USDC,
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: EthereumMainnet.chainId,
  },
  [Polygon.chainId]: {
    ...BASE_USDC,
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    chainId: Polygon.chainId,
  },
  [Optimism.chainId]: {
    ...BASE_USDC,
    address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    chainId: Optimism.chainId,
  },
  [Arbitrum.chainId]: {
    ...BASE_USDC,
    address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    chainId: Arbitrum.chainId,
  },
  [Goerli.chainId]: {
    ...BASE_USDC,
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    chainId: Goerli.chainId,
  },
};

export const USDT = {
  [EthereumMainnet.chainId]: {
    ...BASE_USDT,
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    chainId: EthereumMainnet.chainId,
  },
  [Polygon.chainId]: {
    ...BASE_USDT,
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    chainId: Polygon.chainId,
  },
  [Optimism.chainId]: {
    ...BASE_USDT,
    address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    chainId: Optimism.chainId,
  },
  [Arbitrum.chainId]: {
    ...BASE_USDT,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    chainId: Arbitrum.chainId,
  },
};

export const DAI = {
  [EthereumMainnet.chainId]: {
    ...BASE_DAI,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    chainId: EthereumMainnet.chainId,
  },
  [Polygon.chainId]: {
    ...BASE_DAI,
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    chainId: Polygon.chainId,
  },
  [Optimism.chainId]: {
    ...BASE_DAI,
    address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    chainId: Optimism.chainId,
  },
  [Arbitrum.chainId]: {
    ...BASE_DAI,
    address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    chainId: Arbitrum.chainId,
  },
};

export const findToken = (chainId, address) => {
  const match = [
    USDC[chainId],
    USDT[chainId],
    DAI[chainId],
    WETH[chainId],
  ].filter(t => t && t.address.toLowerCase() === address.toLowerCase())[0];
  if (match) {
    return match;
  }
  const net = Networks[+chainId];
  if (net.wrappedCurrency.address.toLowerCase() === address.toLowerCase()) {
    return net.wrappedCurrency;
  }
  return null;
};

export const getTokens = chainId => {
  return [
    USDC[chainId],
    USDT[chainId],
    DAI[chainId],
    Networks[chainId].wrappedCurrency,
  ].reduce((o, t) => {
    if (t) {
      o[t.symbol] = t;
    }
    return o;
  }, {});
};
