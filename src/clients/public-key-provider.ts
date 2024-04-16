import { DEFAULT_BASE_API_URL } from '../common';
import * as identityNamespace from '../services/identity-namespace';

export class PublicKeyProvider {
  constructor(baseApiUrl = DEFAULT_BASE_API_URL) {
    identityNamespace.init(baseApiUrl);
  }

  async getPublicKey(gidUuid: string): Promise<string> {
    return (await getIdentity(gidUuid)).public_key;
  }
}

async function getIdentity(gidUuid: string): Promise<identityNamespace.Identity> {
  try {
    return await identityNamespace.getIdentityPublic(gidUuid);
  } catch (error) {
    throw new IdentityNotFoundError(gidUuid);
  }
}

export class IdentityNotFoundError extends Error {
  constructor(gidUuid: string) {
    super(`No identity found with GlobaliD UUID ${gidUuid}`);
  }
}

export default PublicKeyProvider;
