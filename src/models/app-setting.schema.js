/**
 * @name - App Settings schama
 * @description - Mongoose schema for App Settings.
 */
import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
  },
  { versionKey: false, strict: false }
);
export const AppSetting =
  mongoose.models.AppSetting || mongoose.model('AppSetting', appSettingsSchema);
