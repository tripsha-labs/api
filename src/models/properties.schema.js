/**
 * @name - Properties schema
 * @description - Mongouse schema for Properties.
 */

import mongoose from 'mongoose';

const propertiesSchema = new mongoose.Schema(
  {
    tripId: { type: String },
    name: { type: String },
    photos: { type: Array },
    dates: { type: Array },
    roomsBooked: { type: String },
    address: { type: String },
    website: { type: String },
    amenities: { type: Array },
    contact: { type: String },
    cleaningCrew: { type: String },
    buildingType: { type: String },
    eventUse: { type: String },
    maxPeople: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Properties =
  mongoose.models.Properties || mongoose.model('Properties', propertiesSchema);
