import { mocked } from 'ts-jest/utils';

import { stub } from '../../test/stubs';
import * as identityNamespace from '../services/identity-namespace';
import { IdentityNotFoundError, PublicKeyNotFoundError, PublicKeyProvider } from './public-key-provider';

jest.mock('../services/identity-namespace');

const mockedIdentityNamespace = mocked(identityNamespace);

describe('PublicKeyProvider', () => {
  describe('#getPublicKey', () => {
    const publicKeyProvider = new PublicKeyProvider();
    const gidUuid = 'some-uuid';
    const identity = stub<identityNamespace.Identity>({
      public_signing_key: 'some-public-key'
    });

    it('should return public key', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(identity);

      const publicKey = await publicKeyProvider.getPublicKey(gidUuid);

      expect(publicKey).toEqual(identity.public_signing_key);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledTimes(1);
      expect(mockedIdentityNamespace.getIdentityPublic).toHaveBeenCalledWith(gidUuid);
    });

    it('should throw IdentityNotFoundError if service fails', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockRejectedValueOnce(new Error());

      await expect(publicKeyProvider.getPublicKey(gidUuid)).rejects.toThrow(IdentityNotFoundError);
    });

    it('should throw PublicKeyNotFoundError if public key missing from response', async () => {
      mockedIdentityNamespace.getIdentityPublic.mockResolvedValueOnce(stub({}));

      await expect(publicKeyProvider.getPublicKey(gidUuid)).rejects.toThrow(PublicKeyNotFoundError);
    });
  });
});
