import { UserController } from '../user.ctrl';
jest.mock('../../../utils/db-connector');
describe('Create User', () => {
  test('Undefined name greet', () => {
    const greet = UserController.sayHello();
    expect(greet).toBe('Hello World!');
  });

  test('Empty name greet', () => {
    const greet = UserController.sayHello('');
    expect(greet).toBe('Hello World!');
  });

  test('Null name greet', () => {
    const greet = UserController.sayHello(null);
    expect(greet).toBe('Hello World!');
  });

  test('With all valid details', async () => {
    const user = {
      firstName: 'Sanjay',
      lastName: 'Madane',
      email: 'sanjay@test.com',
      password: 'SecretPass',
    };
    const resUser = await UserController.createUser(user);
    console.log(resUser);
    expect(resUser['id']).toBe('id_of_the_item');
  });
});
