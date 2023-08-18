import { Multicall, Permit2 } from '../../helpers/crypto';
import { ERC20Token } from './ERC20Token';
import { TripshaWallet } from './TripshaWallet';

/**
 * Abstraction of how payments are executed.
 */
export class PaymentExecution {
  constructor(props) {
    /**
     * Assemble two execution calls to multicall. One to transfer funds
     * from attendee to Tripsha (for which a spending allowance was signed)
     * and another from Tripsha to the organizer (which may or may not include a
     * fee).
     */
    const { booking, trip } = props;

    this.booking = booking;
    this.trip = trip;

    const details = booking.cryptoPaymentMethod;
    const opts = trip.draft.cryptoPaymentOptions;
    if (!details || !opts) {
      throw new Error('No crypto payment details and/or options found');
    }

    this.details = details;
    this.options = opts;

    const {
      nonce,
      amount,
      token,
      chainId,
      wallet,
      signature,
      deadline,
    } = details;

    this.chainId = chainId;
    const { receivingWallet } = opts;
    if (!receivingWallet) {
      throw new Error(
        'Trip organizer did not provide a receiving wallet address'
      );
    }

    this.tripshaWallet = TripshaWallet.instance.getWallet(chainId);

    /**
     * NOTE: originally, I tried to combine these two calls into a single
     * multicall transaction. However, because the RPC endpoint does not
     * simulate state changes while estimating gas (or at least my test setup
     * did not do this), it would require us to override gas limit setting and
     * force transaction to be submitted on-chain. This could cause us to pay
     * for failed transactions that we could have detected offchain.
     *
     * So instead, we submit two separate transactions. See below.
     */
    //first transfer from attendee to tripsha via permit2
    this.permit2CallRequest = Permit2.prepareTransferFromCall({
      nonce,
      token,
      deadline,
      amount,
      signature,
      payee: this.tripshaWallet.address,
      signer: wallet,
    });

    //then from tripsha to organizer
    this.erc20TransferRequest = ERC20Token.assembleTransferCall({
      token,
      receiver: receivingWallet,
      amount,
      chainId,
    });
  }

  /**
   * Determine if the traveler has sufficient funds to pay for booking
   */
  async attendeeHasFunds() {
    const details = this.details;
    const opts = this.options;
    if (!details || !opts) {
      throw new Error('No crypto payment details and/or options found');
    }

    const { amount, token, chainId, wallet } = details;
    const bal = await ERC20Token.balanceOf({
      owner: wallet,
      token,
      chainId,
    });
    return bal >= BigInt(amount.toString());
  }

  /**
   * Check whether the traveler's spend allowance signature is still good.
   */
  async signatureValid() {
    const {
      nonce,
      amount,
      token,
      chainId,
      wallet,
      signature,
      deadline,
    } = this.details;
    this.tripshaWallet = TripshaWallet.instance.getWallet(chainId);
    try {
      /**
       * the transfer is a test that checks two things:
       *  1) does the user's spend allowance still exist and is not expired for Permit2
       *  2) is the signature still valid and not expired
       *
       * If an exception isn't thrown, then both checks passed
       */
      await Permit2.estimateTransfer({
        nonce,
        token,
        deadline,
        amount,
        signature,
        tripshaWallet: this.tripshaWallet,
        payee: this.tripshaWallet.address,
        signer: wallet,
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  /**
   *
   * Execute the transfers to Tripsha and host.
   */
  async execute() {
    //two transactions since multicall cannot interpret state change and fails on estimate gas
    const {
      nonce,
      amount,
      token,
      chainId,
      wallet,
      signature,
      deadline,
      tripshaTransferComplete,
    } = this.details;
    this.tripshaWallet = TripshaWallet.instance.getWallet(chainId);

    //see if we've completed the tripsha part in a previous run
    if (tripshaTransferComplete) {
      console.log('Skipping Tripsha transfer since already complete');

      console.log('Transfer payment token from Tripsha to organizer');
      //just transfer tokens from tripsha to host
      await ERC20Token.transfer({
        token,
        receiver: this.options.receivingWallet,
        amount,
        execWallet: this.tripshaWallet,
        onSuccess: this.tokenTransferSuccess.bind(this),
        onFail: this.tokenTransferFailed.bind(this),
      });
    } else {
      console.log('Transferring payment from attendee to Tripsha');
      //transfer funds from traveler to tripsha. If successful, see tripshaTransferSuccess callback.
      await Permit2.transferFrom({
        payee: this.tripshaWallet.address,
        nonce,
        token,
        deadline,
        amount,
        signature,
        tripshaWallet: this.tripshaWallet,
        signer: wallet,
        onFail: this.tripshaTransferFailed.bind(this),
        onSuccess: this.tripshaTransferSuccess.bind(this),
      });
    }

    //return state that was set during transaction steps.
    return {
      tripshaTransferResult: this.tripshaTransferResult,
      tripshaTransferError: this.tripshaTransferError,
      tokenTransferResult: this.tokenTransferResult,
      tokenTransferError: this.tokenTransferError,
    };
  }

  /**
   * Callback from Permit2 when transfer from traveler to Tripsha completes.
   */
  async tripshaTransferSuccess(txnAndReceipt) {
    const { receipt: r } = txnAndReceipt;
    this.tripshaTransferResult = txnAndReceipt;

    console.log('Transfer to Tripsha finished; checking status...');

    //the blockchain receipt has a status field indicating whether something
    //went wrong on-chain.
    if (!r || !r.status) {
      console.log('Transfer from attendee to tripsha failed', r);
      this.tripshaTransferError = new Error('Tripsha transfer failed');
      return;
    }

    const { token, amount } = this.details;

    console.log(
      'Transfer to Tripsha complete. Transferring payment to organizer'
    );
    //now transfer from Tripsha to host.
    /**
     * NOTE: Could take a fee here by deducting some portion of "amount" and leaving it
     * in the tripsha wallet.
     */
    await ERC20Token.transfer({
      token,
      receiver: this.options.receivingWallet,
      amount,
      execWallet: this.tripshaWallet,
      onSuccess: this.tokenTransferSuccess.bind(this),
      onFail: this.tokenTransferFailed.bind(this),
    });
  }

  /**
   * Called when there is a problem with traveler -> Tripsha transfer
   */
  async tripshaTransferFailed(err, txnAndReceipt) {
    this.tripshaTransferError = err;
    this.tripshaTransferResult = txnAndReceipt;
  }

  /**
   *
   * Called when the token transfer succeeds from Tripsha -> host
   */
  async tokenTransferSuccess(txnAndReceipt) {
    console.log('Token transfer from Tripsha to organizer complete');
    this.tokenTransferResult = txnAndReceipt;
  }

  /**
   * Called when the token transfer from Tripsha->host fails.
   */
  async tokenTransferFailed(err, txnAndReceipt) {
    this.tokenTransferError = err;
    this.tokenTransferResult = txnAndReceipt;
  }
}
