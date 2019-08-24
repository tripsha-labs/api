import { TagsController } from '../tags.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List Tags', () => {
  test('With valid input', async () => {
    const result = await TagsController.listTags({});
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const result = await TagsController.listTags();
    expect(result).to.have.property('data');
  });

  test('With valid search input', async () => {
    const result = await TagsController.listTags({ search: 'tech' });
    expect(result).to.have.property('data');
  });
});
