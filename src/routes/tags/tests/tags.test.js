import { TagsController } from '../tags.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List Tags', () => {
  test('With valid input', async () => {
    const { error, result } = await TagsController.listTags({});
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await TagsController.listTags();
    expect(error).to.equal('Invalid input');
  });

  test('With valid search input', async () => {
    const { error, result } = await TagsController.listTags({ search: 'tech' });
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
});
