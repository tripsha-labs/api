if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
import { createServer } from './createServer';
import { dbConnect } from './utils/db-connect';

const main = async () => {
  const app = createServer();

  const dbUri = process.env.DB_CONN || 'mongodb://localhost:27017/tripsha-db';
  await dbConnect(dbUri);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
};

main();
