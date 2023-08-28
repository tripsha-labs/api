/**
 * @name - DB connector
 * @description - Mongodb connector
 */
import mongoose from 'mongoose';

export const dbConnect = async (uri: string) => {
  try {
    return await mongoose.connect(uri, {
      ssl: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      poolSize: 10,
    });
  } catch (error) {
    console.log('DB connection error', error);
  }
};
