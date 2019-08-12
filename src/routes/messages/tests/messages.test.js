import { MessageController } from '../message.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List conversations', () => {
  test('With valid input', async () => {
    const params = { userId: 'id_of_the_item', groupId: 'id_of_the_item' };
    const { error, result } = await MessageController.listConversations(params);
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await MessageController.listConversations({});
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
});

describe('List messages', () => {
  test('With valid input', async () => {
    const params = { userId: 'id_of_the_item', groupId: 'id_of_the_item' };
    const { error, result } = await MessageController.listMessages(params);
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await MessageController.listMessages({});
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
});

describe('Send Message', () => {
  test('With valid input', async () => {
    const params = { userId: 'id_of_the_item', groupId: 'id_of_the_item' };
    const { error, result } = await MessageController.sendMessageRest(params);
    expect(error).to.equal(null);
  });
});
