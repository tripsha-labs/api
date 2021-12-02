/**
 * @name - Country schema
 * @description - Mongoose schema for Country.
 */
import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
  },
  { versionKey: false, strict: true }
);

export const Country =
  mongoose.models.Country || mongoose.model('Country', countrySchema);
