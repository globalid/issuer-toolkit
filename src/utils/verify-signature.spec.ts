import * as crypto from 'globalid-crypto-library';

import { credentialRequest, publicSigningKey, stubCredentialRequest } from '../../test/stubs';
import { InvalidSignatureError, verifySignature } from './verify-signature';

test('should verify signature', () => {
  expect(() => verifySignature(credentialRequest, publicSigningKey)).not.toThrow();
});

test('should verify signature with no request data', () => {
  const request = stubCredentialRequest(Date.now(), false);

  expect(() => verifySignature(request, publicSigningKey)).not.toThrow();
});

test('should throw InvalidSignatureError if message was not signed with the specified key pair', () => {
  const { publicSigningKey: publicKey } = crypto.ED25519.generateKeys();

  expect(() => verifySignature(credentialRequest, publicKey)).toThrow(InvalidSignatureError);
});
