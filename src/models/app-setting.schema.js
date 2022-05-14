/**
 * @name - App Settings schama
 * @description - Mongoose schema for App Settings.
 */
import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    data: { type: Object, required: true },
  },
  { versionKey: false, strict: true }
);
export const AppSetting =
  mongoose.models.AppSetting || mongoose.model('AppSetting', appSettingsSchema);
