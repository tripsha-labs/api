/**
 * @name - DB connector
 * @description - Mongodb connector
 */
import mongoose from 'mongoose';

export const dbConnect = async res => {
  if (mongoose.connection.readyState) {
    console.log('Re-using existing database connection');
    return Promise.resolve();
  }
  await mongoose.connect(process.env.DB_CONN, {
    ssl: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    poolSize: 5,
  });
};
