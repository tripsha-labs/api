/**
 * @name - DB connector
 * @description - Mongodb connector
 */
import mongoose from 'mongoose';
// mongoose.Promise = global.Promise;

export const dbConnect = async res => {
  // if (mongoose.connection.readyState) {
  //   console.log('Re-using existing database connection');
  //   return Promise.resolve();
  // }
  await mongoose.connect(process.env.DB_CONN, {
    ssl: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    poolSize: 1,
  });
  res.on('finish', function() {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  });
  // .then(db => {
  //   console.log('Database connection esablished');
  // });
};
