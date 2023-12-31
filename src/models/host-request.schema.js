/**
 * @name - HostRequest schema
 * @description - Mongoose schema for HostRequest.
 */

import mongoose from 'mongoose';

const hostRequestSchema = new mongoose.Schema(
  {
    awsUserId: { type: String, required: true, index: true },
    kindOfTripHostingOverview: { type: String, required: true },
    hostingCapacity: { type: String, required: true },
    hostingForCountries: {
      type: Array,
      required: true,
      items: { type: String },
    },
    targetingTypesOfTravelers: { type: String, required: true },
    groupTripHostingExperience: { type: String, required: true },
    pastAccomplishmentReferences: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'declined'],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const HostRequest =
  mongoose.models.Hosts || mongoose.model('Hosts', hostRequestSchema);
