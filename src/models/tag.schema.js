/**
 * @name - Tag schama
 * @description - Mongoose schema for tags.
 */
import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
  },
  { versionKey: false, strict: true }
);
export const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
