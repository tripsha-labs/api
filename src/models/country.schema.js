import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
  },
  { versionKey: false }
);

export const Country =
  mongoose.models.Country || mongoose.model('Country', countrySchema);
