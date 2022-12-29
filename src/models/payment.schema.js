/**
 * @name - Payment schema
 * @description - This is the mongoose payment schema.
 */
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    tripId: { type: String, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    description: { type: String },
    paymentDate: { type: Number },
    tags: { type: Array },
    attachments: { type: Array },
    comments: { type: Array },
    amount: { type: Number },
    foreignAmount: { type: Number },
    currencyType: { type: String },
    type: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
