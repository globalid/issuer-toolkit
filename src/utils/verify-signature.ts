import * as crypto from 'crypto';

import { CredentialRequest } from '../common';

export type PublicKey = crypto.KeyLike | crypto.VerifyKeyObjectInput | crypto.VerifyPublicKeyInput;

/**
 * Verifies the `signature` of the given credential request and throws an error if it's invalid.
 * @param request Credential request to be validated
 * @param publicKey Public key used to verify signature
 * @throws {@linkcode InvalidSignatureError} if `signature` is invalid
 */
export function verifySignature(request: CredentialRequest, publicKey: PublicKey): void {
  const payload = request.payload === undefined ? '' : JSON.stringify(request.payload);
  const data = Buffer.from(`${request.threadId}${request.timestamp}${payload}`);
  const signature = Buffer.from(request.signature, 'base64');
  const valid = crypto.verify(null, data, publicKey, signature);
  if (!valid) {
    throw new InvalidSignatureError();
  }
}

export class InvalidSignatureError extends Error {
  constructor() {
    super('Credential request signature is invalid');
  }
}

export default verifySignature;
