/**
 * @name - Activity Logs schema
 * @description - This is the mongoose activity logs schema.
 */
import mongoose from 'mongoose';

const activityLogsSchema = new mongoose.Schema(
  {
    audienceIds: { type: Array },
    message: { type: String },
    type: { type: String },
    tripId: { type: String },
    bookingId: { type: String },
    userId: { type: String },
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
