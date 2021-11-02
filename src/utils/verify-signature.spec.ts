import crypto from 'crypto';

import { gidCredentialRequest, publicKey } from '../../test/stubs';
import { InvalidSignatureError, verifySignature } from './verify-signature';

test('should not throw if signature is valid', () => {
  expect(() => verifySignature(gidCredentialRequest, publicKey)).not.toThrow();
});

test('should throw InvalidSignatureError if signature is invalid', () => {
  const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  expect(() => verifySignature(gidCredentialRequest, publicKey)).toThrow(InvalidSignatureError);
});
