/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest.
 */

import mongoose, { Schema } from 'mongoose';

const assetLinkSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['trip', 'chat', 'profile'] },
    resource_id: { type: Schema.Types.ObjectId, index: true },
    asset_id: { type: Schema.Types.ObjectId, index: true },
    user_id: { type: Schema.Types.ObjectId, index: true },
  },
  {
    strict: true,
  }
);
export const AssetLink =
  mongoose.models.AssetLink || mongoose.model('AssetLink', assetLinkSchema);
