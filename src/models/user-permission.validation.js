/**
 * @name - UserPermission validator
 * @description - The UserPermission schema validator.
 */
import Validator from 'fastest-validator';

const UserPermissionSchema = {
  emails: {
    type: 'array',
    empty: false,
    required: true,
    items: {
      type: 'string',
    },
  },
  tripId: { type: 'string', empty: false, required: true },
  tabPermissions: {
    type: 'object',
    optional: true,
  },
  coHost: { type: 'boolean', optional: true },
  viewPermissions: {
    type: 'object',
    optional: true,
  },
  topicPermissions: {
    type: 'object',
    optional: true,
  },
  groups: {
    type: 'array',
    optional: true,
    items: {
      type: 'string',
    },
  },
};
export const createUserPermissionValidation = new Validator().compile({
  ...UserPermissionSchema,
  $$strict: 'remove',
});
export const updateUserPermissionValidation = new Validator().compile({
  ...UserPermissionSchema,
  $$strict: 'remove',
});
