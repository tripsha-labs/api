import { UserModel, validateTripLength } from './';
import { expect } from 'chai';
jest.mock('../utils/db-connector');

describe('getUserByUsername', () => {
  test('With valid input', async () => {
    const userModel = new UserModel();
    const res = await userModel.getUserByUsername('');
    expect(res).to.have.property('Items');
  });
});

describe('validateTripLength', () => {
  test('With valid input', async () => {
    const res = validateTripLength('20190301', '20190302');
    expect(res).to.equal(1);
  });
  test('With invalid input', async () => {
    const res = validateTripLength('20190302', '20190301');
    expect(res).to.equal(-1);
  });
});
