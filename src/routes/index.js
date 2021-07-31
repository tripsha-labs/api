const serverless = require('serverless-http');
const express = require('express');
import { dbConnect } from '../utils';
import Countries from './countries';
import Tags from './tags';
import TripTags from './trip-tags';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  await dbConnect(res);
  next();
});
app.use('/tags', Tags);
app.use('/countries', Countries);
app.use('/trip-tags', TripTags);

export const handler = serverless(app);
