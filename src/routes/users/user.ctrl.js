import { UserModel } from '../../models';
export class UserController {
  // static sayHello(name) {
  //   if (name !== undefined && name !== null && name !== '') {
  //     return `Hello ${name}`;
  //   } else {
  //     return 'Hello World!';
  //   }
  // }
  static async createUser(user) {
    const userObject = {
      ...user,
    };
    const userModel = new UserModel();
    const res = await userModel.add(userObject);
    return res.Item;
  }

  // static async update(user) {
  //   console.log(user);
  // }
}
