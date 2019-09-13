import { CountryController } from '../country.ctrl';
import { expect } from 'chai';
jest.mock('../../../utils/db-connector');

describe('List Countries', () => {
  test('With valid input', async () => {
    const result = await CountryController.listCountries({});
    expect(result).to.have.property('data');
  });
  test('With invalid input', async () => {
    const result = await CountryController.listCountries();
    expect(result).to.have.property('data');
  });
  test('With valid search input', async () => {
    const result = await CountryController.listCountries({
      search: 'tech',
    });
    expect(result).to.have.property('data');
  });
});
