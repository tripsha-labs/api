import { UserController } from '../user.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('Create User', () => {
  test('With all valid user object', async () => {
    const user = {
      firstName: 'Sanjay',
      lastName: 'Madane',
      email: 'sanjay@test.com',
      id: 'id_of_the_item',
    };
    const { error, result } = await UserController.createUser(user);
    expect(result['id']).to.equal('id_of_the_item');
  });
  test('With empty object', async () => {
    const user = {};
    const { error } = await UserController.createUser(user);
    expect(error).to.be.an('array');
  });
});

describe('Update User', () => {
  test('With all valid user object', async () => {
    const user = {
      firstName: 'Sanjay',
      lastName: 'Madane',
    };
    const id = 'id_of_the_item';
    const { error, result } = await UserController.updateUser(id, user);
    expect(error).to.equal(null);
  });
  test('With empty object-> all fields optional', async () => {
    const user = {};
    const id = 'id_of_the_item';
    const { error, result } = await UserController.updateUser(id, user);
    expect(error).to.be.null;
  });
  test('With empty fields should throw an error', async () => {
    const user = {
      firstName: '',
    };
    const id = 'id_of_the_item';
    const { error, result } = await UserController.updateUser(id, user);
    expect(error).to.be.an('array');
  });
});
