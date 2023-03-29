import * as crypto from 'globalid-crypto-library';
import { Claims, CredentialOffer, CredentialRequest } from '../src';

export const accessToken = 'some-access-token';
export const clientId = '54fbadc6-9840-43b1-8caf-2cefc14a6fbc';
export const clientSecret = 'some-client-secret';

export const threadId = 'some-thread-id';
export const gidUuid = '54fbadc6-9840-43b1-8caf-2cefc14a6fbc';
const defaultRequestData = {
  foo: 'bar',
  bar: 42,
  baz: true
};

export const { privateKey, publicSigningKey, publicEncryptionKey } = crypto.ED25519.generateKeys();
export const credentialRequest = stubCredentialRequest(Date.now());

export function stubCredentialRequest(timestamp: number, withData = true): CredentialRequest {
  const requestData = withData ? defaultRequestData : undefined;
  const dataToSign = `${timestamp}${threadId}${requestData === undefined ? '' : JSON.stringify(requestData)}`;
  const signature = crypto.ED25519.signMessage(dataToSign, privateKey);

  return {
    gidUuid,
    threadId,
    timestamp,
    data: requestData,
    signature
  };
}

interface EmailClaims extends Claims {
  email: string;
}

export const credentialOffer: CredentialOffer<EmailClaims> = {
  threadId: threadId,
  contextUri: 'https://credentials.global.id/test',
  claims: { email: 'a@b.c' },
  name: 'offer',
  subjectType: 'Email'
};

export function stub<T>(value: Partial<T> = {}): T {
  return value as jest.Mocked<T>;
}
