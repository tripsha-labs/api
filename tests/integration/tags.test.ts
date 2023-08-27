import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createServer } from '../../src/createServer';

const app = createServer();

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close(true);
  await mongoServer.stop();
});

describe('/tags route', () => {
  it('should list tags', async () => {
    const res = await request(app).get('/public/tags');
    expect(res.statusCode).toEqual(200);
    expect(res.body.result).toEqual({ data: [], count: 0 });
  });
});
