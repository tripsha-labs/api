import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { attachRoutes } from './routes';

export const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(morgan('tiny'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  attachRoutes(app);
  return app;
};
