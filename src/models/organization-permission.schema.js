/**
 * @name - OrganizationPermission schema
 * @description - Mongouse schema for OrganizationPermission.
 */

import mongoose, { Schema } from 'mongoose';

const organizationPermissionSchema = new mongoose.Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    permissions: Array,
    groups: Array,
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  }
);
export const OrganizationPermission =
  mongoose.models.OrganizationPermission ||
  mongoose.model('OrganizationPermission', organizationPermissionSchema);
