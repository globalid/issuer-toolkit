import crypto from 'crypto';
import { GidCredentialRequest } from '../src/common';

export function stub<T>(value: Partial<T>): T {
  return value as jest.Mocked<T>;
}

const threadId = 'some-thread-id';

const payload = {
  foo: 'bar',
  bar: 42,
  baz: true
};

export const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

export function stubGidCredentialRequest(timestamp: number): GidCredentialRequest {
  const dataToSign = Buffer.from(`${threadId}${timestamp}${JSON.stringify(payload)}`);
  const signature = crypto.sign(null, dataToSign, privateKey).toString('base64');
  return {
    gidUuid: 'some-gid-uuid',
    threadId,
    timestamp,
    payload,
    signature
  };
}

export const gidCredentialRequest = stubGidCredentialRequest(Date.now());
