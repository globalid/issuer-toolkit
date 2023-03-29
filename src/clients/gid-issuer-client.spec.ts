import '../../test/setup';

import { createMock } from '@golevelup/ts-jest';

import * as stubs from '../../test/stubs';
import { stubCredentialRequest } from '../../test/stubs';
import AccessTokenProvider from './access-token-provider';
import EpamClient from './epam-client';
import FileUploader from './file-uploader';
import {
  CredentialRequest,
  EagerRequestError,
  ErrorCodes,
  FileObject,
  FileType,
  GidIssuerClient,
  InvalidSignatureError,
  PublicKeyNotFoundError,
  StaleRequestError
} from './gid-issuer-client';
import { PublicKeyProvider } from './public-key-provider';
import { encrypt, sha512sum } from '../utils/crypto';
import { ED25519 } from 'globalid-crypto-library';
import dayjs from 'dayjs';

jest.mock('../utils/crypto');

jest.mock('../utils/download-file');

const accessTokenProvider = createMock<AccessTokenProvider>();
const epamClient = createMock<EpamClient>();
const fileUploader = createMock<FileUploader>();
const publicKeyProvider = createMock<PublicKeyProvider>();

describe('GidIssuerClient', () => {
  let gidIssuerClient: GidIssuerClient;

  beforeEach(() => {
    gidIssuerClient = new GidIssuerClient(accessTokenProvider, epamClient, fileUploader, publicKeyProvider);
  });

  it('should expose client credentials', () => {
    expect(gidIssuerClient.clientId).toEqual(accessTokenProvider.clientId);
    expect(gidIssuerClient.clientSecret).toEqual(accessTokenProvider.clientSecret);
  });

  describe('#getAccessToken', () => {
    it('should delegate to AccessTokenProvider', async () => {
      accessTokenProvider.getAccessToken.mockResolvedValueOnce(stubs.accessToken);

      const result = await gidIssuerClient.getAccessToken();

      expect(result).toEqual(stubs.accessToken);
      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('#reportError', () => {
    it('should delegate to EpamClient', async () => {
      const errorCode = ErrorCodes.GidUnavailable;

      await gidIssuerClient.reportError(stubs.threadId, errorCode);

      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });
  });

  describe('#sendOffer', () => {
    it('should delegate to EpamClient', async () => {
      await gidIssuerClient.sendOffer(stubs.credentialOffer);

      expect(epamClient.sendOffer).toHaveBeenCalledTimes(1);
      expect(epamClient.sendOffer).toHaveBeenCalledWith(stubs.credentialOffer);
    });
  });

  describe('#uploadFile', () => {
    it('should encrypt file and delegate upload to FileUploader', async () => {
      const alice = ED25519.generateKeys();
      const bob = ED25519.generateKeys();
      const fileObject: FileObject = {
        name: '99ea0c8c-6116-48f4-89c1-cf3aaf6e9adc.filename.jpg',
        type: FileType.JPEG,
        content: Buffer.from('definitely a valid image')
      };
      const { name, type } = fileObject;
      const url = 'https://example.com/uploads/some-key';
      fileUploader.uploadEncryptedFile.mockResolvedValueOnce(url);

      const result = await gidIssuerClient.uploadFile(fileObject, {
        gidUuid: stubs.gidUuid,
        privateKey: alice.privateKey,
        publicEncryptionKey: bob.publicEncryptionKey
      });

      const checksum = sha512sum(fileObject.content);
      expect(result).toEqual({ url, name, type, sha512sum: checksum });
      const encryptedContent = encrypt(fileObject.content, alice.privateKey, bob.publicEncryptionKey);
      expect(fileUploader.uploadEncryptedFile).toHaveBeenCalledWith(stubs.gidUuid, name, type, encryptedContent);
    });
  });

  describe('#validateRequest', () => {
    beforeEach(() => {
      publicKeyProvider.getPublicSigningKey.mockResolvedValue(stubs.publicSigningKey);
    });

    it('should not report error when request is valid', async () => {
      await expect(gidIssuerClient.validateRequest(stubs.credentialRequest)).resolves.not.toThrow();
      expect(epamClient.reportError).not.toHaveBeenCalled();
    });

    it('should report 600-16 on InvalidSignatureError', async () => {
      const { privateKey } = ED25519.generateKeys();
      const invalidSignature = ED25519.signMessage('msg', privateKey);
      const credentialRequest: CredentialRequest = {
        ...stubs.credentialRequest,
        signature: invalidSignature
      };

      await expect(gidIssuerClient.validateRequest(credentialRequest)).rejects.toThrow(InvalidSignatureError);

      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(credentialRequest.threadId, '600-16');
    });

    it('should report 600-16 on StaleRequestError', async () => {
      const credentialRequest: CredentialRequest = stubCredentialRequest(dayjs().subtract(10, 'minutes').unix() * 1000);

      await expect(gidIssuerClient.validateRequest(credentialRequest)).rejects.toThrow(StaleRequestError);

      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(credentialRequest.threadId, '600-16');
    });

    it('should report 600-16 on EagerRequestError', async () => {
      const credentialRequest: CredentialRequest = stubCredentialRequest(dayjs().add(10, 'minutes').unix() * 1000);

      await expect(gidIssuerClient.validateRequest(credentialRequest)).rejects.toThrow(EagerRequestError);

      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(credentialRequest.threadId, '600-16');
    });

    it('should report 600-7 for any other error', async () => {
      publicKeyProvider.getPublicSigningKey.mockRejectedValueOnce(new PublicKeyNotFoundError('gid'));

      await expect(gidIssuerClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(PublicKeyNotFoundError);

      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.credentialRequest.threadId, '600-7');
    });
  });
});
