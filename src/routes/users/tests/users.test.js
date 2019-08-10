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
  test('With empty object should throw an error array', async () => {
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

describe('Delete User', () => {
  test('With valid user id', async () => {
    const id = 'id_of_the_item';
    const { error, result } = await UserController.deleteUser(id);
    expect(error).to.equal(null);
    expect(result).to.equal('success');
  });
  test('With invalid user id', async () => {
    const id = '';
    const { error, result } = await UserController.deleteUser(id);
    expect(error).to.equal('Failed to delete');
  });
});

describe('Get User', () => {
  test('With valid user id', async () => {
    const id = 'id_of_the_item';
    const { error, result } = await UserController.getUser(id);
    expect(error).to.equal(null);
    expect(result).to.have.property('id');
  });
  test('With invalid user id', async () => {
    const id = '';
    const { error, result } = await UserController.getUser(id);
    expect(error).to.equal('User not found');
  });
});

describe('List Users', () => {
  test('With valid input', async () => {
    const { error, result } = await UserController.listUser({});
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await UserController.listUser({});
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
});

describe('Check User exists', () => {
  test('With user exists', async () => {
    const username = 'sanjay';
    const { error, result } = await UserController.isExists(username);
    expect(error).to.equal(null);
    expect(result).to.be.true;
  });
  test('With user not exists', async () => {
    const username = 'xyz';
    const { error, result } = await UserController.isExists(username);
    expect(result).to.be.false;
  });
});
