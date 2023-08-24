/**
 * @name - Asset schema
 * @description - Mongouse schema for Asset.
 */

import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'image' },
    url: { type: String },
    thumbnailUrl: { type: String },
    userId: { type: String, index: true },
    caption: { type: String },
    isArchived: { type: Boolean, index: true, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Asset =
  mongoose.models.Asset || mongoose.model('Asset', assetSchema);
