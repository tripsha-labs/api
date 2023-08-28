/**
 * @name - CryptoWalletSchema schema
 * @description - This is the mongoose collection schema for user wallet info.
 */
import mongoose from 'mongoose';

const CryptoWalletSchema = new mongoose.Schema(
  {
    //wallet's address
    address: { type: String, index: true },

    //the chain it operates on
    chainId: { type: Number, index: true },
    /**
     * Critical signature spend allowance nonce. This must be unique when submitted on-chain. Gaps are
     * allowed but reuse will fail to submit. Nonces are chain-specific so a new wallet instance
     * must be created for traveler per chain when they submit payment details.
     */
    spendAllowanceNonces: { type: Object },
    lastUpdatedTime: { type: Number },

    //we can use this to attache any pending charges and maybe know which nonces are used. I kept it
    //simple for now.
    pendingCharges: { type: Object },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
CryptoWalletSchema.index({ chainId: 1, address: 1 }, { unique: true });

export const CryptoWallet =
  mongoose.models.CryptoWallet ||
  mongoose.model('CryptoWallet', CryptoWalletSchema);
