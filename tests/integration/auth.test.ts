// import { Amplify, Auth } from 'aws-amplify';

// Amplify.configure({
//   Auth: {
//     region: 'us-east-1',
//     userPoolId: 'us-east-1_T9sr5PVQK',
//     userPoolWebClientId: '7hgi04cnpa8f00ehbop9hgn3jh',
//     identityPoolId: 'us-east-1:18e01458-d23d-4c69-ae98-f1b61ec40430',
//   },
// });

// describe('Amplify Auth', () => {
//   it('should create, sign in, and delete a test user', async () => {
//     const username = 'APItestUser@example.com';
//     const password = 'testPassword123';
//     // Create user
//     const newUser = await Auth.signUp({
//       username: username,
//       password: 'testPassword123',
//     //   attributes: {
//     //     email: username,
//     //   },
//     });
//     console.log(newUser);
//     Auth.confirmSignUp

//     expect(newUser).toBeDefined();
//     expect(newUser.user.getUsername()).toEqual(username);

//     // Sign in user
//     const user = await Auth.signIn(username, password);
//     expect(user).toBeDefined();
//     expect(user.username).toEqual(username);
//     console.log(user);
//     // Delete user
//     await Auth.deleteUser();
//     const deletedUser = await Auth.signIn(username, password);
//     expect(deletedUser).toBeUndefined();
//   });
// });
