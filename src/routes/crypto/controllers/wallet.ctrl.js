import { CryptoWalletModel } from '../../../models';

/**
 * Abstraction to perform actions against wallet model
 */
export class WalletController {
  /**
   * Get the spend allowance nonce to use for signing payment requests. Note that this does not
   * actually use the nonce until a signature is stored for use and payment is made on chain. This
   * just represents a unique one-up counter for the given wallet address and chain. Gaps in nonce
   * values on-chain are ok for Permit2 contract so having "dangling" unused nonces will not cause
   * issues.
   */
  static async getNextSpendAllowanceNonce(params) {
    const { chainId, address, token } = params;
    if (!chainId || !address || !token) {
      throw new Error('Require chainId, address, and token for nonce lookup');
    }

    const w = await CryptoWalletModel.get({
      chainId,
      address: address.toLowerCase(),
    });
    if (!w) {
      await CryptoWalletModel.create({
        chainId,
        address: address.toLowerCase(),
        spendAllowanceNonces: {
          [token.toLowerCase()]: 0,
        },
      });
      return 1;
    }
    const n = w.spendAllowanceNonces[token.toLowerCase()] || 0;

    return n + 1;
  }

  /**
   * Increase the next spending nonce by 1 indicating that it's been used on-chain.
   */
  static async increaseNonce(params) {
    const { chainId, address, token, nonce } = params;
    const w = await CryptoWalletModel.get({
      chainId,
      address: address.toLowerCase(),
    });
    if (w) {
      w.spendAllowanceNonces[token.toLowerCase()] = nonce + 1;
      await CryptoWalletModel.update({ _id: w._id }, w);
    }
  }
}
