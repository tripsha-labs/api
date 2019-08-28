import mongoose from 'mongoose';

const tripTagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
  },
  { versionKey: false, strict: true }
);
export const TripTag =
  mongoose.models.TripTag || mongoose.model('TripTag', tripTagSchema);
