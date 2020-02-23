/**
 * @name - Connnection schema
 * @description - Mongouse schema for Connnection
 */

import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    connectionId: String,
    awsUsername: String,
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Connection =
  mongoose.models.Connection || mongoose.model('Connection', connectionSchema);
