/**
 * @name - Resource Collection schema
 * @description - This is the mongoose collection schema.
 */
import mongoose, { Schema } from 'mongoose';

const ResourceCollectionSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId },
    title: { type: String },
    resourceType: { type: String },
    columns: { type: Array },
    addedBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const ResourceCollection =
  mongoose.models.ResourceCollection ||
  mongoose.model('ResourceCollection', ResourceCollectionSchema);

const ResourceSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId },
    title: { type: String },
    resourceType: { type: String },
    addedBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
    collectionId: { type: Schema.Types.ObjectId },
    airline: { type: String },
    flightNumber: { type: String },
    departureAirport: { type: String },
    pickupPoint: { type: String },
    dropoffPoint: { type: String },
    departureTime: { type: Number },
    arrivalAirport: { type: String },
    arrivalTime: { type: Number },
    quantity: { type: Number },
    capacity: { type: Number },
    assigned: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Resource =
  mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);

const BookingResourceSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId },
    resourceId: { type: Schema.Types.ObjectId },
    bookingId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const BookingResource =
  mongoose.models.BookingResource ||
  mongoose.model('BookingResource', BookingResourceSchema);
