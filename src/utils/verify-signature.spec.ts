import crypto from 'crypto';

import { credentialRequest, publicKey, stubCredentialRequest } from '../../test/stubs';
import { InvalidSignatureError, verifySignature } from './verify-signature';

test('should verify signature', () => {
  expect(() => verifySignature(credentialRequest, publicKey)).not.toThrow();
});

test('should verify signature with no request data', () => {
  const request = stubCredentialRequest(Date.now(), false);

  expect(() => verifySignature(request, publicKey)).not.toThrow();
});

test('should throw InvalidSignatureError if signature is invalid', () => {
  const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  expect(() => verifySignature(credentialRequest, publicKey)).toThrow(InvalidSignatureError);
});
