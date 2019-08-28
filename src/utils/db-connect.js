import mongoose from 'mongoose';

export const dbConnect = () => {
  return mongoose.connect(
    'mongodb+srv://tripsha:UdwDWQzbr842RywY@cluster0-2yi6n.mongodb.net/test?retryWrites=true&w=majority',
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
