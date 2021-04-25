/**
 * @name - DB connector
 * @description - Mongodb connector
 */
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
let isConnected;

export const dbConnect = () => {
  if (isConnected) {
    console.log('Re-using existing database connection');
    return Promise.resolve();
  }
  console.log('Creating new database connection');
  return mongoose
    .connect(process.env.DB_CONN, {
      // ssl: process.env.IS_OFFLINE ? false : true,
      ssl: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then(db => {
      isConnected = db.connections[0].readyState;
    });
};
