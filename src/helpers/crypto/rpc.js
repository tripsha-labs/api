import { Networks } from '../../constants/crypto/networks';
import { ethers } from 'ethers';

/**
 * RPC provider is how we call on-chain. Each network has its own RPC endpoint url. For simulation
 * we can use a local node such as hardhat.
 */
export class RPCProviders {
  constructor() {
    this.providers = {};
    Object.keys(Networks).forEach(id => {
      id = +id;
      const n = Networks[id];
      const rpc = n.rpcEndpoints[0];
      this.providers[id] = new ethers.providers.JsonRpcProvider(rpc, id);
    });
  }

  getProvider(chainId) {
    return this.providers[+chainId];
  }
}
