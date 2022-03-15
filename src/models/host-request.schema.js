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
    targettingTypesOfTravelers: { type: String, required: true },
    groupTripHostingExperience: { type: String, required: true },
    pastAccomplishmentReferences: { type: String },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'declined'],
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
