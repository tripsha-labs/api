import mongoose from 'mongoose';

export const dbConnect = () => {
  return mongoose.connect(
    'mongodb+srv://tirpshaUser:uuIzpETYyEwtJfvW@cluster0-8nvxf.mongodb.net/test?retryWrites=true&w=majority',
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
