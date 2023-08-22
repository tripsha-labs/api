/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest.
 */

import mongoose, { Schema } from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    couponCode: { type: String, index: true }, // length 4-12, number+letter
    discType: { type: String },
    amount: { type: Number },
    maxRedemptions: { type: Number, default: 0 },
    timesRedeemed: { type: Number, default: 0 },
    expiryDate: {
      type: String,
      index: true,
    },
    organizationId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicableType: {
      type: String,
    },
    specificValues: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
couponSchema.index({ couponCode: 1, userId: 1 }, { unique: true });
export const Coupon =
  mongoose.models.Coupons || mongoose.model('Coupons', couponSchema);
