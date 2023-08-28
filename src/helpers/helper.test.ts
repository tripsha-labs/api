/**
 * @name - Helper tests
 * @description - Helper module test cases
 */
import { errorSanitizer } from './common';
import { queryBuilder, keyPrefixAlterer } from '.';

describe('errorSanitizer', () => {
  test('With valid input', async () => {
    const errors = errorSanitizer({ code: 'ERROR', message: 'error message' });
    expect(Array.isArray(errors)).toBe(true);
  });
  test('With invalid input', async () => {
    const error = errorSanitizer('error message');
    expect(error).toBe('error message');
  });
});

describe('keyPrefixAlterer', () => {
  test('With valid input', async () => {
    const key = keyPrefixAlterer({ username: 'test' });
    expect(typeof key).toBe('object');
    expect(key).toHaveProperty(':username');
  });
  test('With invalid input', async () => {
    const key = keyPrefixAlterer('');
    expect(typeof key).toBe('object');
    expect(key).not.toHaveProperty(':username');
  });
});

describe('queryBuilder', () => {
  test('With valid input', async () => {
    const key = queryBuilder({ username: 'test' });
    expect(key).toBe('username=:username');
  });
  test('With invalid input', async () => {
    const key = queryBuilder('');
    expect(key).toEqual('');
  });
});
