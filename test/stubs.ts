import crypto from 'crypto';
import { CredentialRequest } from '../src/common';

export const accessToken = 'some-access-token';
export const clientId = 'some-client-id';
export const clientSecret = 'some-client-secret';

export const threadId = 'some-thread-id';
export const gidUuid = 'some-gid-uuid';
const defaultRequestData = {
  foo: 'bar',
  bar: 42,
  baz: true
};

export const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

export const credentialRequest = stubCredentialRequest(Date.now());

export function stubCredentialRequest(timestamp: number, withData = true): CredentialRequest {
  const requestData = withData ? defaultRequestData : undefined;
  const dataToSign = Buffer.from(
    `${timestamp}${threadId}${requestData === undefined ? '' : JSON.stringify(requestData)}`
  );
  const signature = crypto.sign(null, dataToSign, privateKey).toString('base64');
  return {
    gidUuid,
    threadId,
    timestamp,
    data: requestData,
    signature
  };
}

export function stub<T>(value: Partial<T> = {}): T {
  return value as jest.Mocked<T>;
}
