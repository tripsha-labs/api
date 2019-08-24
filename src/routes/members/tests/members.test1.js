// import { MemberController } from '../member.ctrl';
// import { expect } from 'chai';
// jest.mock('../../../utils/db-connector');

// describe('List Members', () => {
//   test('With valid input', async () => {
//     const params = {
//       tripId: 'id_of_the_item',
//     };
//     const { error, result } = await MemberController.listMembers(params);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
//   test('With invalid input', async () => {
//     const params = {
//       tripId: 'id_of_the_item',
//     };
//     const { error, result } = await MemberController.listMembers(params);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
// });

// describe('Member Actions', () => {
//   test('With valid input - add member', async () => {
//     const params = {
//       tripId: 'id_of_the_item',
//     };
//     const action = { memberIds: ['id_of_the_item'], action: 'addMember' };
//     const { error, result } = await MemberController.memberAction(
//       params,
//       action
//     );
//     expect(error).to.equal(null);
//   });
//   test('With valid input - remove member', async () => {
//     const params = {
//       tripId: 'id_of_the_item',
//     };
//     const action = { memberIds: ['id_of_the_item'], action: 'removeMember' };
//     const { error, result } = await MemberController.memberAction(
//       params,
//       action
//     );
//     expect(error).to.equal(null);
//   });
//   test('With valid input - make favorite', async () => {
//     const params = {
//       tripId: 'id_of_the_item',
//     };
//     const action = { memberIds: ['id_of_the_item'], action: 'makeFavorite' };
//     const { error, result } = await MemberController.memberAction(
//       params,
//       action
//     );
//     expect(error).to.equal(null);
//   });
//   test('With valid input - make un favorite', async () => {
//     const params = {
//       tripId: 'id_of_the_item',
//     };
//     const action = { memberIds: ['id_of_the_item'], action: 'makeUnFavorite' };
//     const { error, result } = await MemberController.memberAction(
//       params,
//       action
//     );
//     expect(error).to.equal(null);
//   });
// });
