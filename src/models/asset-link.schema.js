/**
 * @name - Approval schema
 * @description - Mongouse schema for HostRequest.
 */

import mongoose, { Schema } from 'mongoose';

const assetLinkSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['trip', 'chat', 'profile'] },
    resource_id: { type: Schema.Types.ObjectId },
    asset_id: { type: Schema.Types.ObjectId },
    user_id: { type: Schema.Types.ObjectId },
  },
  {
    strict: true,
  }
);
export const AssetLink =
  mongoose.models.AssetLink || mongoose.model('AssetLinks', assetLinkSchema);
