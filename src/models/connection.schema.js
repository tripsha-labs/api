/**
 * @name - Connnection schema
 * @description - Mongoose schema for Connnection.
 */

import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    connectionId: { type: String, index: true },
    awsUsername: { type: String, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const Connection =
  mongoose.models.Connection || mongoose.model('Connection', connectionSchema);
