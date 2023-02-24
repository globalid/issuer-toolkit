import '../../test/setup';

import { stub } from '../../test/stubs';
import * as identityNamespace from '../services/identity-namespace';
import { IdentityNotFoundError, PublicKeyNotFoundError, PublicKeyProvider } from './public-key-provider';

jest.mock('../services/identity-namespace');

const mockedIdentityNamespace = jest.mocked(identityNamespace);

describe('PublicKeyProvider', () => {
  let publicKeyProvider: PublicKeyProvider;

  beforeEach(() => {
    publicKeyProvider = new PublicKeyProvider();
  });

  const gidUuid = 'some-uuid';
  const identity = stub<identityNamespace.Identity>({
    public_encryption_key: 'another-public-key',
    public_signing_key: 'some-public-key'
  });

  describe('#getPublicEncryptionKey', () => {
    it('should return public encryption key', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(identity);

      const publicKey = await publicKeyProvider.getPublicEncryptionKey(gidUuid);

      expect(publicKey).toEqual(identity.public_encryption_key);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledTimes(1);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledWith(gidUuid);
    });

    it('should throw IdentityNotFoundError if service fails', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockRejectedValueOnce(new Error());

      await expect(publicKeyProvider.getPublicEncryptionKey(gidUuid)).rejects.toThrow(IdentityNotFoundError);
    });

    it('should throw PublicKeyNotFoundError if public encryption key missing from response', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(stub());

      await expect(publicKeyProvider.getPublicEncryptionKey(gidUuid)).rejects.toThrow(PublicKeyNotFoundError);
    });
  });

  describe('getPublicSigningKey', () => {
    it('should return public signing key', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(identity);

      const publicKey = await publicKeyProvider.getPublicSigningKey(gidUuid);

      expect(publicKey).toEqual(identity.public_signing_key);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledTimes(1);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledWith(gidUuid);
    });

    it('should throw IdentityNotFoundError if service fails', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockRejectedValueOnce(new Error());

      await expect(publicKeyProvider.getPublicSigningKey(gidUuid)).rejects.toThrow(IdentityNotFoundError);
    });

    it('should throw PublicKeyNotFoundError if public signing key missing from response', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(stub());

      await expect(publicKeyProvider.getPublicSigningKey(gidUuid)).rejects.toThrow(PublicKeyNotFoundError);
    });
  });
});
