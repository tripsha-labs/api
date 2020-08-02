/**
 * @name - Activity Logs schema
 * @description - This is mongoose activity logs schema
 */
import mongoose from 'mongoose';

const activityLogsSchema = new mongoose.Schema(
  {
    userId: { type: String },
    message: { type: String },
    type: { type: String },
    tripId: { type: String },
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
