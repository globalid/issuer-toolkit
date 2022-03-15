import { DEFAULT_BASE_API_URL } from '../common';
import * as identityNamespace from '../services/identity-namespace';

export class PublicKeyProvider {
  constructor(baseApiUrl = DEFAULT_BASE_API_URL) {
    identityNamespace.init(baseApiUrl);
  }

  async getPublicEncryptionKey(gidUuid: string): Promise<string> {
    return getPublicKey(gidUuid, PublicKeyType.Encryption);
  }

  async getPublicSigningKey(gidUuid: string): Promise<string> {
    return getPublicKey(gidUuid, PublicKeyType.Signing);
  }
}

async function getPublicKey(gidUuid: string, type: PublicKeyType): Promise<string> {
  const identity = await getIdentity(gidUuid);
  if (typeof identity[type] !== 'string') {
    throw new PublicKeyNotFoundError(gidUuid);
  }
  return identity[type];
}

enum PublicKeyType {
  Encryption = 'public_encryption_key',
  Signing = 'public_signing_key'
}

async function getIdentity(gidUuid: string): Promise<identityNamespace.Identity> {
  try {
    return identityNamespace.getIdentityPublic(gidUuid);
  } catch (error) {
    throw new IdentityNotFoundError(gidUuid);
  }
}

export class IdentityNotFoundError extends Error {
  constructor(gidUuid: string) {
    super(`No identity found with GlobaliD UUID ${gidUuid}`);
  }
}

export class PublicKeyNotFoundError extends Error {
  constructor(gidUuid: string) {
    super(`No public key found corresponding to the GlobaliD UUID ${gidUuid}`);
  }
}

export default PublicKeyProvider;
