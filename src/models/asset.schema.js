/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest.
 */

import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'image' },
    url: { type: String },
    thumbnailUrl: { type: String },
    userId: { type: String },
    caption: { type: String },
    refCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Asset =
  mongoose.models.Assets || mongoose.model('Assets', assetSchema);
