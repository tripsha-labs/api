/**
 * @name - Organization schema
 * @description - Mongouse schema for Organization.
 */

import mongoose, { Schema } from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    avatarUrl: String,
    coverPhotoUrl: String,
    facebookUrl: String,
    twitterUrl: String,
    websiteUrl: String,
    discordUrl: String,
    instagramUrl: String,
    isConcierge: { type: Boolean, default: false },
    isStripeAccountConnected: { type: Boolean, default: false },
    hostShare: { type: Number, default: 94 },
    isActive: { type: Boolean, default: true },
    ownerId: { type: Schema.Types.ObjectId, index: true },
    createdBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Organization =
  mongoose.models.Organization ||
  mongoose.model('Organization', organizationSchema);
