/**
 * @name - UserPermission Collection schema
 * @description - This is the mongoose collection schema.
 */
import mongoose, { Schema } from 'mongoose';

const UserPermissionSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    email: { type: String, index: true },
    coHost: { type: Boolean },
    tabPermissions: { type: Object },
    viewPermissions: { type: Object },
    topicPermissions: { type: Object },
    directPermissions: { type: Object },
    addedBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const UserPermission =
  mongoose.models.UserPermission ||
  mongoose.model('UserPermission', UserPermissionSchema);
