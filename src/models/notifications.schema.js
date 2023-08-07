/**
 * @name - Mongoose schema for NotificationMessages model.
 */
import mongoose from 'mongoose';

const notificationsSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    message: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    emailMessage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const NotificationMessages =
  mongoose.models.NotificationMessages ||
  mongoose.model('NotificationMessages', notificationsSchema);
