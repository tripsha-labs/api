import { MessageController } from '../message.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List conversations', () => {
  test('With valid input', async () => {
    const params = { userId: 'id_of_the_item', groupId: 'id_of_the_item' };
    const result = await MessageController.listConversations(params);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    try {
      await MessageController.listConversations({});
    } catch (error) {
      expect(error).to.equal(null);
    }
  });
});

describe('List messages', () => {
  test('With valid input', async () => {
    const params = { userId: 'id_of_the_item', groupId: 'id_of_the_item' };
    const result = await MessageController.listMessages(params);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    try {
      await MessageController.listMessages({});
    } catch (error) {
      expect(error).to.equal(null);
    }
  });
});

describe('Send Message', () => {
  test('With valid input', async () => {
    const params = { userId: 'id_of_the_item', groupId: 'id_of_the_item' };
    const result = await MessageController.sendMessageRest(params);
    console.log(result);
    expect(result).to.have.property('data');
  });
});
