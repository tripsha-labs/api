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
    .connect(
      // 'mongodb+srv://tripsha:UdwDWQzbr842RywY@cluster0-2yi6n.mongodb.net/test?retryWrites=true&w=majority', // Dev
      // 'mongodb+srv://tirpshaUser:uuIzpETYyEwtJfvW@cluster0-8nvxf.mongodb.net/test?retryWrites=true&w=majority', // staging old
      // 'mongodb+srv://tripshaAdmin:Uwem1QsM3ebAvYu8@cluster0-sftgo.mongodb.net/test?retryWrites=true&w=majority', // staging
      // 'mongodb+srv://tripshaAdmin:Uwem1QsM3ebAvYu8@tripshaclustor-sftgo.mongodb.net/test?retryWrites=true&w=majority', //prod
      process.env.DB_CONN,
      {
        ssl: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      }
    )
    .then(db => {
      isConnected = db.connections[0].readyState;
    });
};
