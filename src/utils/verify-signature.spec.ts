import crypto from 'crypto';

import { gidCredentialRequest, publicKey, stubGidCredentialRequest } from '../../test/stubs';
import { InvalidSignatureError, verifySignature } from './verify-signature';

test('should verify signature', () => {
  expect(() => verifySignature(gidCredentialRequest, publicKey)).not.toThrow();
});

test('should verify signature with no payload', () => {
  const request = stubGidCredentialRequest(Date.now(), false);

  expect(() => verifySignature(request, publicKey)).not.toThrow();
});

test('should throw InvalidSignatureError if signature is invalid', () => {
  const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  expect(() => verifySignature(gidCredentialRequest, publicKey)).toThrow(InvalidSignatureError);
});
