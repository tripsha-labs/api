/**
 * @name - model tests
 * @description - This contains model test cases
 */
import { UserModel, validateTripLength } from '.';


describe('validateTripLength', () => {
  test('With valid input', async () => {
    const res = validateTripLength('20190301', '20190302');
    expect(res).toEqual(1);
  });
  test('With invalid input', async () => {
    const res = validateTripLength('20190302', '20190301');
    expect(res).toEqual(-1);
  });
});
