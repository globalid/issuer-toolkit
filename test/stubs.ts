import crypto from 'crypto';
import { GidCredentialRequest } from '../src/common';

export const accessToken = 'some-access-token';
export const clientId = 'some-client-id';
export const clientSecret = 'some-client-secret';

export const threadId = 'some-thread-id';
export const gidUuid = 'some-gid-uuid';
const payload = {
  foo: 'bar',
  bar: 42,
  baz: true
};

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
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

export { publicKey };

export const gidCredentialRequest = stubGidCredentialRequest(Date.now());

export function stubGidCredentialRequest(timestamp: number): GidCredentialRequest {
  const dataToSign = Buffer.from(`${threadId}${timestamp}${JSON.stringify(payload)}`);
  const signature = crypto.sign(null, dataToSign, privateKey).toString('base64');
  return {
    gidUuid,
    threadId,
    timestamp,
    payload,
    signature
  };
}

export function stub<T>(value: Partial<T> = {}): T {
  return value as jest.Mocked<T>;
}
