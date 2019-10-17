/**
 * @name - DB connector
 * @description - Mongodb connector
 */
import mongoose from 'mongoose';

export const dbConnect = () => {
  return mongoose.connect(
    // 'mongodb+srv://tripsha:UdwDWQzbr842RywY@cluster0-2yi6n.mongodb.net/test?retryWrites=true&w=majority', // Dev
    'mongodb+srv://tirpshaUser:uuIzpETYyEwtJfvW@cluster0-8nvxf.mongodb.net/test?retryWrites=true&w=majority', // staging
    // 'mongodb+srv://tripshaAdmin:Uwem1QsM3ebAvYu8@tripshaclustor-sftgo.mongodb.net/test?retryWrites=true&w=majority', //prod
    {
      ssl: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }
  );
};

export const dbClose = () => {
  return mongoose.connection.close();
};
