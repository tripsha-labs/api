/**
 * @name - Utils tests
 * @description - This contains test cases for utility
 */
import { expect } from 'chai';
import { apigwManagementApi } from './aws-api';
import { success, failure } from './response';

describe('apigwManagementApi', () => {
  test('With valid input', async () => {
    const res = apigwManagementApi('endpoint');
    expect(res).to.be.an('object');
  });
});

describe('success', () => {
  test('With valid input', async () => {
    const res = success({});
    expect(res).to.be.an('object');
    expect(res).to.have.property('headers');
  });
});

describe('failure', () => {
  test('With valid input', async () => {
    const res = failure({});
    expect(res).to.be.an('object');
    expect(res).to.have.property('headers');
  });
});
