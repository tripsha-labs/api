/**
 * @name - GroupPermission Collection schema
 * @description - This is the mongoose collection schema.
 */
import mongoose, { Schema } from 'mongoose';

const GroupPermissionSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    name: { type: String, index: true },
    tabPermissions: { type: Object },
    viewPermissions: { type: Object },
    topicPermissions: { type: Object },
    type: { type: String, enum: ['user', 'view'], default: 'user' },
    viewId: { type: String },
    addedBy: { type: Schema.Types.ObjectId },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const GroupPermission =
  mongoose.models.GroupPermission ||
  mongoose.model('GroupPermission', GroupPermissionSchema);

const GroupUsersSchema = new mongoose.Schema(
  {
    tripId: { type: Schema.Types.ObjectId, index: true },
    email: { type: String },
    groupId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);

export const GroupUser =
  mongoose.models.GroupUser || mongoose.model('GroupUser', GroupUsersSchema);
