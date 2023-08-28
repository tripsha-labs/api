import { NextFunction, Request, Response, Application } from 'express';
import { failureResponse } from '../utils';
import Countries from './countries';
import Tags from './tags';
import Currency from './currency';
import TripTags from './trip-tags';
import Trips from './trips';
import NoAuthTrips from './trips/noAuth';
import Activities from './activity-logs';
import HostRequests from './hosts';
import Approvals from './approvals';
import Bookings from './bookings';
import Members from './members';
import Messages from './messages';
import Migrations from './migrations';
import Payments from './payments';
import Users from './users';
import Seeds from './seeds';
import AdminApi from './users/admin';
import Coupons from './coupons';
import Schedules from './schedules';
import EmailNotifications from './email-notifications';
import Assets from './assets';
import UserExists from './user-exists';
import PublicProfile from './public-profile';
import HostPayment from './host-payments';
import DirectoryMembers from './member-directory';
import Resources from './resources';
import Links from './links';
import Billing from './billing';
import Permissions from './permissions';
import Topics from './topics';
import Crypto from './crypto';
import Properties from './properties';
import { UserModel } from '../models';
import { ERROR_KEYS } from '../constants/error-codes';

interface RequestWithUser extends Request {
  currentUser: any; // Replace 'any' with the type of your user object
  requestContext: RequestContext;
}

interface RequestContext {
  identity: {
    cognitoIdentityId: string;
  };
}

const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const requestWithUser = req as RequestWithUser;
  try {
    const awsUserId =
      requestWithUser?.requestContext?.identity?.cognitoIdentityId;
    if (!awsUserId) return failureResponse(res, ERROR_KEYS.UNAUTHENTICATED);
    requestWithUser.currentUser = await UserModel.get({ awsUserId: awsUserId });
    console.log('CURRENT USER', requestWithUser.currentUser);
    if (requestWithUser.currentUser)
      requestWithUser.currentUser['awsUserId'] = awsUserId;
    return next();
  } catch (err) {
    return failureResponse(res, ERROR_KEYS.UNAUTHORIZED);
  }
};

export const attachRoutes = (app: Application) => {
  // Public Routes
  app.use('/public/tags', Tags);
  app.use('/public/currency-exchange', Currency);
  app.use('/public/schedules', Schedules);
  app.use('/public/countries', Countries);
  app.use('/public/migrations', Migrations);
  app.use('/public/seeds', Seeds);
  app.use('/public/trip-tags', TripTags);
  app.use('/public/trips', NoAuthTrips);
  app.use('/public/check-user-exists', UserExists);
  app.use('/public/profile', PublicProfile);
  // Protected Routes
  app.use('/trips', verifyAuth, Trips);
  app.use('/activities', verifyAuth, Activities);
  app.use('/host-requests', verifyAuth, HostRequests);
  app.use('/approvals', verifyAuth, Approvals);
  app.use('/bookings', verifyAuth, Bookings);
  app.use('/members', verifyAuth, Members);
  app.use('/conversations', verifyAuth, Messages);
  app.use('/payments', verifyAuth, Payments);
  app.use('/users', verifyAuth, Users);
  app.use('/admin', verifyAuth, AdminApi);
  app.use('/coupons', verifyAuth, Coupons);
  app.use('/email-notifications', verifyAuth, EmailNotifications);
  app.use('/assets', verifyAuth, Assets);
  app.use('/host-payments', verifyAuth, HostPayment);
  app.use('/directory-members', verifyAuth, DirectoryMembers);
  app.use('/resources', verifyAuth, Resources);
  app.use('/links', verifyAuth, Links);
  app.use('/billing', verifyAuth, Billing);
  app.use('/permissions', verifyAuth, Permissions);
  app.use('/topics', verifyAuth, Topics);
  app.use('/crypto', verifyAuth, Crypto);
  app.use('/properties', verifyAuth, Properties);
  return app;
};
