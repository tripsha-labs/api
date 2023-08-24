/**
 * @name - Member directory schema
 * @description - Mongoose schema for Member directory.
 */

import mongoose, { Schema } from 'mongoose';

const memberDirectorySchema = new mongoose.Schema(
  {
    tripshaId: { type: Schema.Types.ObjectId, index: true },
    hostId: { type: String, index: true },
    organizationId: { type: Schema.Types.ObjectId, index: true },
    email: { type: String },
    name: { type: String },
    company: { type: String },
    team: { type: String },
    visaStatus: String,
    dietaryRequirements: String,
    emergencyContact: String,
    mobilityRestrictions: String,
    livesIn: String,
    passportCountry: { type: Array },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const MemberDirectory =
  mongoose.models.MemberDirectory ||
  mongoose.model('MemberDirectory', memberDirectorySchema);
