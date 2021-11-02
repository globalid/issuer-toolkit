import * as identityNamespace from '../services/identity-namespace';

export class PublicKeyProvider {
  constructor(gidApiHost: string = 'api.global.id') {
    // TODO: validate parameters
    identityNamespace.init(`https://${gidApiHost}`);
  }

  async getPublicKey(gidUuid: string): Promise<string> {
    let identity: identityNamespace.Identity;
    try {
      identity = await identityNamespace.getIdentityPublic(gidUuid);
    } catch (error) {
      throw new IdentityNotFoundError(gidUuid);
    }
    if (typeof identity.public_signing_key !== 'string') {
      throw new PublicKeyNotFoundError(gidUuid);
    }
    return identity.public_signing_key;
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
