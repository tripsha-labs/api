import { CountryController } from '../country.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List Countries', () => {
  test('With valid input', async () => {
    const { error, result } = await CountryController.listCountries({});
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const { error, result } = await CountryController.listCountries();
    expect(error).to.equal('Invalid input');
  });
  test('With valid search input', async () => {
    const { error, result } = await CountryController.listCountries({
      search: 'tech',
    });
    expect(error).to.equal(null);
    expect(result).to.have.property('data');
  });
});
