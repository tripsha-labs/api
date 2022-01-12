const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
import { dbConnect } from '../utils';
import Countries from './countries';
import Tags from './tags';
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
  app.use('/public/schedules', Schedules);
  app.use('/public/countries', Countries);
  app.use('/public/migrations', Migrations);
  app.use('/public/seeds', Seeds);
  app.use('/public/trip-tags', TripTags);
  app.use('/public/trips', NoAuthTrips);
  return app;
};

const auth = () => {
  const app = express();
  app.use(cors());
  app.use(morgan('tiny'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(async (req, res, next) => {
    await dbConnect(res);
    next();
  });
  app.use('/trips', Trips);
  app.use('/activities', Activities);
  app.use('/host-requests', HostRequests);
  app.use('/approvals', Approvals);
  app.use('/bookings', Bookings);
  app.use('/members', Members);
  app.use('/conversations', Messages);
  app.use('/payments', Payments);
  app.use('/users', Users);
  app.use('/admin', AdminApi);
  app.use('/coupons', Coupons);
  return app;
};

export const PublicAPI = serverless(noAuth());
export const API = serverless(auth());
