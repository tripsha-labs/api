/**
 * @name - Resource Collection schema
 * @description - This is the mongoose collection schema.
 */
import mongoose from 'mongoose';

const ResourceCollectionSchema = new mongoose.Schema(
  {
    tripId: { type: String },
    title: { type: String },
    addedBy: { type: String },
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
    tripId: { type: String },
    title: { type: String },
    addedBy: { type: String },
    collectionId: { type: String },
    type: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Resource =
  mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
