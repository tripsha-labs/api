// @ts-nocheck
// const serverless = require('serverless-http');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { dbConnect } from '../utils';
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

const noAuth = () => {
  const app = express();
  app.use(cors());
  app.use(morgan('tiny'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(async (req, res, next) => {
    await dbConnect(res);
    next();
  });
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
  return app;
};

const auth = () => {
  const app = express();
  app.use(cors());
  app.use(morgan('tiny'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(async (req, res, next) => {
    if (process.env.IS_OFFLINE) {
      req.requestContext.identity.cognitoIdentityId =
        //sanjay
        //'us-east-1:1570527a-efa7-46b3-a317-b4b8c4108494';

        //mike@thorium
        'us-east-1:87671c41-aa70-4a80-aa2b-2bccbc49bb32';
    }
    await dbConnect(res);
    next();
  });
  const verifyToken = async (req, res, next) => {
    try {
      const awsUserId = req.requestContext.identity.cognitoIdentityId;
      req.currentUser = await UserModel.get({ awsUserId: awsUserId });
      console.log('CURRENT USER', req.currentUser);
      if (req.currentUser) req.currentUser['awsUserId'] = awsUserId;
      return next();
    } catch (err) {
      return failureResponse(res, ERROR_KEYS.INVALID_TOKEN);
    }
  };
  app.use('/trips', verifyToken, Trips);
  app.use('/activities', verifyToken, Activities);
  app.use('/host-requests', verifyToken, HostRequests);
  app.use('/approvals', verifyToken, Approvals);
  app.use('/bookings', verifyToken, Bookings);
  app.use('/members', verifyToken, Members);
  app.use('/conversations', verifyToken, Messages);
  app.use('/payments', verifyToken, Payments);
  app.use('/users', verifyToken, Users);
  app.use('/admin', verifyToken, AdminApi);
  app.use('/coupons', verifyToken, Coupons);
  app.use('/email-notifications', verifyToken, EmailNotifications);
  app.use('/assets', verifyToken, Assets);
  app.use('/host-payments', verifyToken, HostPayment);
  app.use('/directory-members', verifyToken, DirectoryMembers);
  app.use('/resources', verifyToken, Resources);
  app.use('/links', verifyToken, Links);
  app.use('/billing', verifyToken, Billing);
  app.use('/permissions', verifyToken, Permissions);
  app.use('/topics', verifyToken, Topics);
  app.use('/crypto', verifyToken, Crypto);
  app.use('/properties', verifyToken, Properties);
  return app;
};

// export const PublicAPI = serverless(noAuth());
// export const API = serverless(auth());

try {
  noAuth().listen(3000, () =>
    console.log('Public API listening on port 3000!')
  );
} catch (error) {}