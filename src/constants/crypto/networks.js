const getInfuraUrlFor = network =>
  process.env.INFURA_KEY
    ? `https://${network}.infura.io/v3/${process.env.INFURA_KEY}`
    : undefined;
const getAlchemyUrlFor = network =>
  process.env.ALCHEMY_KEY
    ? `https://${network}.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
    : undefined;

export const EthereumMainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  wrappedCurrency: {
    symbol: 'WETH',
    decimals: 18,
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  geckoId: 'ethereum',
  rpcEndpoints: [
    getInfuraUrlFor('mainnet'),
    getAlchemyUrlFor('eth-mainnet'),
    'https://cloudflare-eth.com',
  ].filter(Boolean),
};

export const Polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  geckoId: 'polygon-pos',
  wrappedCurrency: {
    symbol: 'WMATIC',
    decimals: 18,
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  },
  rpcEndpoints: [
    getInfuraUrlFor('polygon-mainnet'),
    'https://polygon-rpc.com',
  ].filter(Boolean),
};

export const Optimism = {
  chainId: 10,
  name: 'Optimism',
  currency: 'ETH',
  geckoId: 'optimistic-ethereum',
  wrappedCurrency: {
    symbol: 'WETH',
    decimals: 18,
    address: '0x4200000000000000000000000000000000000006',
  },
  rpcEndpoints: [
    getInfuraUrlFor('optimism-mainnet'),
    'https://mainnet.optimism.io',
  ].filter(Boolean),
};

export const Arbitrum = {
  chainId: 42161,
  name: 'Arbitrum One',
  currency: 'ETH',
  geckoId: 'arbitrum-one',
  wrappedCurrency: {
    symbol: 'WETH',
    decimals: 18,
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  },
  rpcEndpoints: [
    getInfuraUrlFor('arbitrum-mainnet'),
    'https://arb1.arbitrum.io/rpc',
  ].filter(Boolean),
};

export const Networks = {
  [EthereumMainnet.chainId]: EthereumMainnet,
  [Polygon.chainId]: Polygon,
  [Optimism.chainId]: Optimism,
  [Arbitrum.chainId]: Arbitrum,
};
