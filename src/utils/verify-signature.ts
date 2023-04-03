import * as crypto from 'globalid-crypto-library';

import { CredentialRequest } from '../common';

/**
 * Verifies the `signature` of the given credential request and throws an error if it's invalid.
 * @param request Credential request to be validated
 * @param publicKey Public key used to verify signature
 * @throws {@linkcode InvalidSignatureError} if `signature` is invalid
 */
export function verifySignature(request: CredentialRequest, publicKey: string): void {
  const requestData = request.data === undefined ? '' : JSON.stringify(request.data);
  const data = `${request.timestamp}${request.threadId}${requestData}`;
  const valid = crypto.ED25519.verifySignature(data, publicKey, request.signature);

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
