import permit2ABI from '../../constants/crypto/abi/permit2ABI.json';
import { ethers } from 'ethers';

const ADDR = '0x000000000022d473030f116ddee9f6b43ac78ba3';

/**
 * Permit2 Uniswap spend allowance utility smart contract abstraction. Just makes it easier to
 * interact with contract.
 */
export class Permit2 {
  static get address() {
    return ADDR;
  }

  static prepareTransferFromCall(props) {
    const { nonce, token, deadline, amount, signature, payee, signer } = props;
    const params = [
      {
        permitted: {
          token: token.address ? token.address : token,
          amount: amount.toString(),
        },
        nonce,
        deadline,
      },
      {
        to: payee,
        requestedAmount: amount.toString(),
      },
      signer,
      signature,
    ];
    return {
      tgtAddress: ADDR,
      method:
        'permitTransferFrom(((address,uint256),uint256,uint256),(address,uint256),address,bytes)',
      args: params,
      abi: permit2ABI,
    };
  }

  static encodeTransfer(props) {
    const { nonce, token, deadline, amount, signature, payee, signer } = props;
    const ifc = new ethers.utils.Interface(permit2ABI);
    const params = [
      {
        permitted: {
          token: token.address ? token.address : token,
          amount: amount.toString(),
        },
        nonce,
        deadline,
      },
      {
        to: payee,
        requestedAmount: amount.toString(),
      },
      signer,
      signature,
    ];
    return ifc.encodeFunctionData(
      'permitTransferFrom(((address,uint256),uint256,uint256),(address,uint256),address,bytes)',
      params
    );
  }

  static async estimateTransfer(props) {
    const {
      nonce,
      token,
      deadline,
      amount,
      signature,
      tripshaWallet,
      payee,
      signer,
    } = props;
    const con = new ethers.Contract(ADDR, permit2ABI, tripshaWallet);

    const params = [
      {
        permitted: {
          token: token.address ? token.address : token,
          amount: amount.toString(),
        },
        nonce,
        deadline,
      },
      {
        to: payee,
        requestedAmount: amount.toString(),
      },
      signer,
      signature,
    ];
    return await con.estimateGas[
      'permitTransferFrom(((address,uint256),uint256,uint256),(address,uint256),address,bytes)'
    ](...params);
  }

  static async transferFrom(props) {
    const {
      payee,
      nonce,
      token,
      deadline,
      amount,
      signature,
      tripshaWallet,
      signer,
      onSuccess,
      onFail,
    } = props;
    const con = new ethers.Contract(ADDR, permit2ABI, tripshaWallet);

    const params = [
      {
        permitted: {
          token: token.address ? token.address : token,
          amount: amount.toString(),
        },
        nonce,
        deadline,
      },
      {
        to: payee,
        requestedAmount: amount.toString(),
      },
      signer,
      signature,
    ];
    let txn = undefined;
    let r = undefined;
    try {
      txn = await con[
        'permitTransferFrom(((address,uint256),uint256,uint256),(address,uint256),address,bytes)'
      ](...params);
      r = await txn.wait();
      await onSuccess({ txn, receipt: r });
    } catch (e) {
      await onFail(e, { txn, receipt: r });
    }
  }
}
