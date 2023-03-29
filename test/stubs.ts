import * as crypto from 'globalid-crypto-library';
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

export const { privateKey, publicSigningKey, publicEncryptionKey } = crypto.ED25519.generateKeys()
export const credentialRequest = stubCredentialRequest(Date.now());

export function stubCredentialRequest(timestamp: number, withData = true): CredentialRequest {
  const requestData = withData ? defaultRequestData : undefined;
  const dataToSign = `${timestamp}${threadId}${requestData === undefined ? '' : JSON.stringify(requestData)}`
  const signature = crypto.ED25519.signMessage(dataToSign, privateKey);

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
