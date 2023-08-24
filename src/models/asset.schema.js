/**
 * @name - Asset schema
 * @description - Mongouse schema for Asset.
 */

import mongoose, { Schema } from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'image' },
    url: { type: String },
    thumbnailUrl: { type: String },
    organizationId: { type: Schema.Types.ObjectId, index: true },
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
