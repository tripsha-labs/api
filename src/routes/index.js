const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
import { dbConnect } from '../utils';
import Countries from './countries';
import Tags from './tags';
import TripTags from './trip-tags';
import Trips from './trips';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  await dbConnect(res);
  next();
});
app.use('/tags', Tags);
app.use('/countries', Countries);
app.use('/trip-tags', TripTags);
app.use('/trips', Trips);

export const handler = serverless(app);
