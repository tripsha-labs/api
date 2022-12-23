/**
 * @name - Activity Logs schema
 * @description - This is the mongoose activity logs schema.
 */
import mongoose from 'mongoose';

const activityLogsSchema = new mongoose.Schema(
  {
    audienceIds: { type: Array },
    message: { type: String },
    type: { type: String, index: true },
    tripId: { type: String, index: true },
    bookingId: { type: String, index: true },
    userId: { type: String, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model('ActivityLog', activityLogsSchema);
