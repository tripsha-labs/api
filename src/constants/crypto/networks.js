const getInfuraUrlFor = network =>
  process.env.INFURA_KEY
    ? `https://${network}.infura.io/v3/${process.env.INFURA_KEY}`
    : undefined;
const getAlchemyUrlFor = network =>
  process.env.ALCHEMY_KEY
    ? `https://${network}.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
    : undefined;

const getLocalNetwork = () =>
  process.env.LOCAL_RPC_URL ? process.env.LOCAL_RPC_URL : undefined;

/**
 * All supported networks by Tripsha.
 */

const MCALL = '0xca11bde05977b3631167028862be2a173976ca112';

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
  multiCallAddress: MCALL,
  rpcEndpoints: [
    getLocalNetwork('mainnet'),
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
  multiCallAddress: MCALL,
  rpcEndpoints: [
    getLocalNetwork('polygon-mainnet'),
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
  multiCallAddress: MCALL,
  rpcEndpoints: [
    getLocalNetwork('optimism-mainnet'),
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
  multiCallAddress: MCALL,
  rpcEndpoints: [
    getLocalNetwork('arbitrum-mainnet'),
    getInfuraUrlFor('arbitrum-mainnet'),
    'https://arb1.arbitrum.io/rpc',
  ].filter(Boolean),
};

export const Goerli = {
  chainId: 5,
  name: 'Goerli Testnet',
  currency: 'ETH',
  geckoId: 'goerli',
  wrappedCurrency: {
    symbol: 'WETH',
    decimals: 18,
    address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
  },
  rpcEndpoints: [
    getInfuraUrlFor('goerli'),
    'https://rpc.goerli.eth.gateway.fm',
  ],
};

export const Networks = {
  [EthereumMainnet.chainId]: EthereumMainnet,
  [Polygon.chainId]: Polygon,
  [Optimism.chainId]: Optimism,
  [Arbitrum.chainId]: Arbitrum,
  [Goerli.chainId]: Goerli,
};
