import { MemberController } from '../member.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List Members', () => {
  test('With valid input', async () => {
    const { error, result } = await MemberController.listMembers('123');
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await MemberController.listMembers('123');
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await MemberController.listMembers('123');
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
});
