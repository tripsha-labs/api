/**
 * @name - Approval validation
 * @description - Approval schema validator
 */
import Validator from 'fastest-validator';

const approvalSchema = {
  tripId: { type: 'string', required: true },
  memberId: { type: 'string', optional: true },
  type: {
    type: 'string',
    required: true,
    enum: ['TripRemove', 'MemberRemove'],
  },
  userId: {
    type: 'string',
    required: true,
  },
  message: {
    type: 'string',
    required: true,
  },
  $$strict: true,
};

export const approvalSchemaValidation = new Validator().compile(approvalSchema);
