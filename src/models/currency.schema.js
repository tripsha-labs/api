/**
 * @name - CurrencySchema schema
 * @description - This is the mongoose collection schema.
 */
import mongoose from 'mongoose';

const CurrencySchema = new mongoose.Schema(
  {
    currency: { type: String },
    conversions: { type: Object },
    lastUpdatedTime: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Currency =
  mongoose.models.Currency || mongoose.model('Currency', CurrencySchema);
