/**
 * @name - Helper tests
 * @description - Helper module test cases
 */
import { expect } from 'chai';
import { errorSanitizer, base64Decode, base64Encode } from './common';
import { queryBuilder, keyPrefixAlterer } from './';

describe('errorSanitizer', () => {
  test('With valid input', async () => {
    const error = errorSanitizer({ code: 'ERROR', message: 'error message' });
    expect(error).to.be.an('array');
  });
  test('With invalid input', async () => {
    const error = errorSanitizer('error message');
    expect(error).to.equal('error message');
  });
});

describe('base64Decode', () => {
  test('With valid input', async () => {
    const key = base64Decode('InRva2VuIg==');
    expect(key).to.be.an('object');
    expect(key).to.have.property('ExclusiveStartKey');
  });
  test('With invalid input', async () => {
    const key = base64Decode('');
    expect(key).to.be.an('object');
    expect(key).to.not.have.property('ExclusiveStartKey');
  });
});

describe('base64Encode', () => {
  test('With valid input', async () => {
    const key = base64Encode('token');
    expect(key).to.be.an('object');
    expect(key).to.have.property('nextPageToken');
  });
  test('With invalid input', async () => {
    const key = base64Encode('');
    expect(key).to.be.an('object');
    expect(key).to.not.have.property('nextPageToken');
  });
});

describe('keyPrefixAlterer', () => {
  test('With valid input', async () => {
    const key = keyPrefixAlterer({ username: 'test' });
    expect(key).to.be.an('object');
    expect(key).to.have.property(':username');
  });
  test('With invalid input', async () => {
    const key = keyPrefixAlterer('');
    expect(key).to.be.an('object');
    expect(key).to.not.have.property(':username');
  });
});

describe('queryBuilder', () => {
  test('With valid input', async () => {
    const key = queryBuilder({ username: 'test' });
    expect(key).to.equal('username=:username');
  });
  test('With invalid input', async () => {
    const key = queryBuilder('');
    expect(key).to.equal('');
  });
});
