import erc20ABI from '../../constants/crypto/abi/erc20ABI.json';
import { ethers } from 'ethers';
import { TripshaWallet } from './TripshaWallet';

/**
 * Abstraction for an ERC20 token to generate call data for on-chain submission.
 *
 */
export class ERC20Token {
  static async balanceOf(props) {
    const { token, owner, chainId } = props;
    const execWallet = TripshaWallet.instance.getWallet(chainId);

    const con = new ethers.Contract(token, erc20ABI, execWallet);
    return BigInt((await con.balanceOf(owner)).toString());
  }

  static async transfer(props) {
    const { token, receiver, amount, execWallet, onSuccess, onFail } = props;

    const con = new ethers.Contract(token, erc20ABI, execWallet);
    let txn = undefined;
    let r = undefined;
    try {
      txn = await con.transfer(receiver, amount);
      r = await txn.wait();
      await onSuccess({ txn, receipt: r });
    } catch (e) {
      await onFail(e, { txn, receipt: r });
    }
  }

  static assembleTransferCall(props) {
    const { token, receiver, amount, chainId } = props;

    return {
      method: 'transfer',
      abi: erc20ABI,
      args: [receiver, amount],
      tgtAddress: token,
    };
  }
}
