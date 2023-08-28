/**
 * @name - Utils tests
 * @description - This contains test cases for utility
 */
import { apigwManagementApi } from './aws-api';
import { success, failure } from './response';

describe('apigwManagementApi', () => {
  test('With valid input', async () => {
    const res = apigwManagementApi('endpoint');
    expect(typeof res).toBe('object');
  });
});

describe('success', () => {
  test('With valid input', async () => {
    const res = success({});
    expect(res).toHaveProperty('headers');
  });
});

describe('failure', () => {
  test('With valid input', async () => {
    const res = failure({});
    expect(res).toHaveProperty('headers');
  });
});
