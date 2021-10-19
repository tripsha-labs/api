import { ActivityLog } from '../models';
export const logActivity = params => {
  return ActivityLog.create(params);
};
