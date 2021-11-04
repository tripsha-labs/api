/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    name: { type: String },
    couponCode: { type: String },
    discType: { type: String },
    amount: { type: Number },
    maxRedemptions: { type: Number, default: 0 },
    timesRedeemed: { type: Number, default: 0 },
    expiryDate: {
      type: String,
    },
    userId: {
      type: String,
    },
    tripIds: {
      type: Array,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Coupon =
  mongoose.models.Coupons || mongoose.model('Coupons', couponSchema);
