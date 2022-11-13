/**
 * @name - Link Collection schema
 * @description - This is the mongoose collection schema.
 */
import mongoose, { Schema } from 'mongoose';

const LinkSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId },
    title: { type: String },
    description: { type: String },
    url: { type: String },
    addedBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const Link = mongoose.models.Link || mongoose.model('Link', LinkSchema);
