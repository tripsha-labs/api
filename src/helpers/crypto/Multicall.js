import { ethers } from 'ethers';
import mcallABI from '../../constants/crypto/abi/multicall';

const ADDR = '0xca11bde05977b3631167028862be2a173976ca11';

/**
 * Multicall smart contract helper class. This reduces RPC calls on-chain by combining multiple
 * contract calls into a single request.
 */
export class Multicall {
  static async estimateGas(props) {
    const { execWallet, calls } = props;

    const mcall = new ethers.Contract(ADDR, mcallABI, execWallet);

    const interfaces = [];
    const mcArgs = calls.map(c => {
      const ifc = new ethers.utils.Interface(c.abi);

      interfaces.push(ifc);
      const cd = ifc.encodeFunctionData(c.method, c.args);
      return { target: c.tgtAddress, callData: cd };
    });
    return await mcall.estimateGas.tryAggregate(false, mcArgs);
  }

  static async execute(props) {
    const { execWallet, calls } = props;
    const mcall = new ethers.Contract(ADDR, mcallABI, execWallet);

    const interfaces = [];
    const mcArgs = calls.map(c => {
      const ifc = new ethers.utils.Interface(c.abi);

      interfaces.push(ifc);
      const cd = ifc.encodeFunctionData(c.method, c.args);
      return { target: c.tgtAddress, callData: cd };
    });
    return await mcall.tryAggregate(true, mcArgs);
  }
}
