import '../../test/setup';

import { stub } from '../../test/stubs';
import * as identityNamespace from '../services/identity-namespace';
import { IdentityNotFoundError, PublicKeyProvider } from './public-key-provider';

jest.mock('../services/identity-namespace');

const mockedIdentityNamespace = jest.mocked(identityNamespace);

describe('PublicKeyProvider', () => {
  let publicKeyProvider: PublicKeyProvider;

  beforeEach(() => {
    publicKeyProvider = new PublicKeyProvider();
  });

  const gidUuid = 'some-uuid';
  const identity = stub<identityNamespace.Identity>({
    public_key: 'some-public-key'
  });

  describe('#getPublicEncryptionKey', () => {
    it('should return public key', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(identity);

      const publicKey = await publicKeyProvider.getPublicKey(gidUuid);

      expect(publicKey).toEqual(identity.public_key);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledTimes(1);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledWith(gidUuid);
    });

    it('should throw IdentityNotFoundError if service fails', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockRejectedValueOnce(new Error());

      await expect(publicKeyProvider.getPublicKey(gidUuid)).rejects.toThrow(IdentityNotFoundError);
    });
  });
});
