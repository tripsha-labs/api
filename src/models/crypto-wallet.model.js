/**
 * @name - CryptoWalletModel model
 * @description - CryptoWalletModel DB model.
 */
import { CryptoWallet } from './crypto-wallet.schema';

/**
 * This holds information about traveler wallets. Namely, about the signature nonces
 * used for spend allowances. We could make this more complicated by 'reserving' nonces
 * vs. just keeping a 1-up each time a payment is confirmed.
 */
export class CryptoWalletModel {
  static create(params = {}) {
    const wallet = new CryptoWallet(params);
    return wallet.save();
  }

  static delete(params = {}) {
    return CryptoWallet.deleteOne(params);
  }

  static update(filter, params = {}, upsert = { upsert: false }) {
    return CryptoWallet.updateOne(filter, { $set: params }, upsert);
  }

  static get(params, select) {
    return CryptoWallet.findOne(params, select || {});
  }
}
