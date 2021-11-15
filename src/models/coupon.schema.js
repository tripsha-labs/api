/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    couponCode: { type: String }, // length 4-12, number+letter
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
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableType: {
      type: String,
    },
    specificValues: {
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
