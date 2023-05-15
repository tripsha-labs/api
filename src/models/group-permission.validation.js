/**
 * @name - GroupPermission validator
 * @description - The GroupPermission schema validator.
 */
import Validator from 'fastest-validator';

const GroupPermissionSchema = {
  name: {
    type: 'string',
    empty: false,
    required: true,
  },
  tripId: { type: 'string', empty: false, required: true },
  tabPermissions: {
    type: 'object',
    optional: true,
  },
  viewPermissions: {
    type: 'object',
    optional: true,
  },
  topicPermissions: {
    type: 'object',
    optional: true,
  },
};
export const createGroupPermissionValidation = new Validator().compile({
  ...GroupPermissionSchema,
  $$strict: 'remove',
});
export const updateGroupPermissionValidation = new Validator().compile({
  ...GroupPermissionSchema,
  $$strict: 'remove',
});
