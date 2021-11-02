import * as crypto from 'crypto';

import { GidCredentialRequest } from '../common';

export type PublicKey = crypto.KeyLike | crypto.VerifyKeyObjectInput | crypto.VerifyPublicKeyInput;

/**
 * Verifies the `signature` of the given credential request and throws an error if it's invalid.
 * @param request Credential request to be validated
 * @param publicKey Public key used to verify signature
 * @throws {@link InvalidSignatureError} if `signature` is invalid
 */
export function verifySignature(request: GidCredentialRequest, publicKey: PublicKey): void {
  const data = Buffer.from(`${request.threadId}${request.timestamp}${JSON.stringify(request.payload)}`);
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

export { GidCredentialRequest } from '../common';
export default verifySignature;
