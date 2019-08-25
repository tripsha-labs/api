import mongoose from 'mongoose';
import caBundle from '../caBundle';

export const dbConnect = () => {
  // Development
  return mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Production
  //   return mongoose.connect(
  //     'mongodb://tripshamaster:Tripsha#123@tripsha-2019-08-21-13-14-53.cluster-crydzajsdj7c.us-east-1.docdb.amazonaws.com:27017/?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0',
  //     {
  //       ssl: true,
  //       sslCA: caBundle,
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //     }
  //   );
};
