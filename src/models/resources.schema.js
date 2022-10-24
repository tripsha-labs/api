/**
 * @name - Resource Collection schema
 * @description - This is the mongoose collection schema.
 */
import mongoose, { Schema } from 'mongoose';

const ResourceCollectionSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId },
    title: { type: String },
    addedBy: { type: Schema.Types.ObjectId },
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
    addedBy: { type: Schema.Types.ObjectId },
    collectionId: { type: Schema.Types.ObjectId },
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
