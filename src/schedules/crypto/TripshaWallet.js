import { ethers } from 'ethers';
import { RPCProviders } from '../../helpers/crypto';

/**
 * This is Tripsha's hot wallet that will submit transactions and transfer funds
 * to organizers. It's purpose is to hold the hot wallet's private key and pay for
 * transactions on supported networks.
 *
 * Funds must be provided on EACH network supported to pay for gas fees.
 */
let inst;
export class TripshaWallet {
  static get instance() {
    if (inst) {
      return inst;
    }
    const key = process.env.HOT_WALLET_KEY;
    if (!key) {
      throw new Error('Missing HOT_WALLET_KEY in env');
    }
    inst = new TripshaWallet({ key });
    return inst;
  }

  constructor(props) {
    const { key } = props;
    this.key = key;
    this.wallets = {};
    this.rpcProviders = new RPCProviders();
  }

  getWallet(chainId) {
    let tripshaWallet = this.wallets[chainId];
    if (!tripshaWallet) {
      tripshaWallet = new ethers.Wallet(
        this.key,
        this.rpcProviders.getProvider(+chainId)
      );
      this.wallets[chainId] = tripshaWallet;
    }
    return tripshaWallet;
  }
}
