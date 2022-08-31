import '../../test/setup';

import { mocked } from 'ts-jest/utils';
import { createMock } from '@golevelup/ts-jest';

import * as stubs from '../../test/stubs';
import crypto from '../utils/crypto';
import { validateTimestamp } from '../utils/validate-timestamp';
import * as validation from '../utils/validation';
import { verifySignature } from '../utils/verify-signature';
import AccessTokenProvider from './access-token-provider';
import EpamClient from './epam-client';
import FileUploader from './file-uploader';
import { CredentialOffer, ErrorCodes, FileObject, FileType, GidIssuerClient } from './gid-issuer-client';
import { PublicKeyProvider } from './public-key-provider';

jest.mock('../utils/crypto');

jest.mock('../utils/download-file');

jest.mock('../utils/validate-timestamp', () => ({
  ...jest.requireActual('../utils/validate-timestamp'),
  validateTimestamp: jest.fn()
}));

jest.mock('../utils/validation');

jest.mock('../utils/verify-signature', () => ({
  ...jest.requireActual('../utils/verify-signature'),
  verifySignature: jest.fn()
}));

const { PublicKeyNotFoundError } = jest.requireActual('./public-key-provider');
const { EagerRequestError, StaleRequestError } = jest.requireActual('../utils/validate-timestamp');
const { InvalidSignatureError } = jest.requireActual('../utils/verify-signature');

const accessTokenProvider = createMock<AccessTokenProvider>();
const epamClient = createMock<EpamClient>();
const fileUploader = createMock<FileUploader>();
const publicKeyProvider = createMock<PublicKeyProvider>();
const mockedValidateTimestamp = mocked(validateTimestamp);
const mockedValidation = mocked(validation);
const mockedVerifySignature = mocked(verifySignature);
const mockedEncrypt = mocked(crypto.encrypt);
const mockedSha512Sum = mocked(crypto.sha512sum);

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

      expect(mockedValidation.validate).toHaveBeenCalledTimes(2);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, errorCode, validation.schemas.errorCode);
      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });
  });

  describe('#sendOffer', () => {
    it('should delegate to EpamClient', async () => {
      const offer = stubs.stub<CredentialOffer>();

      await gidIssuerClient.sendOffer(offer);

      expect(mockedValidation.validate).toHaveBeenCalledTimes(1);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenCalledWith(offer, validation.schemas.credentialOffer);
      expect(epamClient.sendOffer).toHaveBeenCalledTimes(1);
      expect(epamClient.sendOffer).toHaveBeenCalledWith(offer);
    });
  });

  describe('#uploadFile', () => {
    it('should encrypt file and delegate upload to FileUploader', async () => {
      const name = 'uuid.foo.jpg';
      const type = FileType.JPEG;
      const content = Buffer.from('definitely a valid image');
      const fileObject: FileObject = { name, type, content };
      const encryptedContent = Buffer.from('lorem ipsum dolor sit amet');
      const url = 'https://example.com/uploads/some-key';
      const decryptionKey = 'foobar';
      const sha512sum = 'abcdefg1234567';
      mockedEncrypt.mockReturnValueOnce([encryptedContent, decryptionKey]);
      fileUploader.uploadEncryptedFile.mockResolvedValueOnce(url);
      mockedSha512Sum.mockReturnValueOnce(sha512sum);

      const result = await gidIssuerClient.uploadFile(stubs.gidUuid, fileObject);

      expect(result).toEqual({ url, decryptionKey, name, type, sha512sum });
      expect(mockedValidation.validate).toHaveBeenCalledTimes(2);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.gidUuid, validation.schemas.uuid);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, fileObject, validation.schemas.fileObject);
      expect(mockedEncrypt).toHaveBeenCalledTimes(1);
      expect(mockedEncrypt).toHaveBeenCalledWith(content);
      expect(fileUploader.uploadEncryptedFile).toHaveBeenCalledTimes(1);
      expect(fileUploader.uploadEncryptedFile).toHaveBeenCalledWith(stubs.gidUuid, name, type, encryptedContent);
      expect(mockedSha512Sum).toHaveBeenCalledTimes(1);
      expect(mockedSha512Sum).toHaveBeenCalledWith(content);
    });
  });

  describe('#validateRequest', () => {
    beforeEach(() => {
      publicKeyProvider.getPublicSigningKey.mockResolvedValue(stubs.publicKey);
    });

    it('should not report error when request is valid', async () => {
      await gidIssuerClient.validateRequest(stubs.credentialRequest);

      expect(mockedValidation.validate).toHaveBeenCalledTimes(1);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenCalledWith(stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(publicKeyProvider.getPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(stubs.credentialRequest);
      expect(epamClient.reportError).not.toHaveBeenCalled();
    });

    it('should report 600-16 on InvalidSignatureError', async () => {
      const errorCode = ErrorCodes.RequestValidationFailed;
      const error = new InvalidSignatureError();
      mockedVerifySignature.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidIssuerClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(error);
      expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, errorCode, validation.schemas.errorCode);
      expect(publicKeyProvider.getPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).not.toHaveBeenCalled();
      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });

    it('should report 600-16 on StaleRequestError', async () => {
      const errorCode = ErrorCodes.RequestValidationFailed;
      const error = new StaleRequestError('', '');
      mockedValidateTimestamp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidIssuerClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(error);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, errorCode, validation.schemas.errorCode);
      expect(publicKeyProvider.getPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(stubs.credentialRequest);
      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });

    it('should report 600-16 on EagerRequestError', async () => {
      const errorCode = ErrorCodes.RequestValidationFailed;
      const error = new EagerRequestError('', '');
      mockedValidateTimestamp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidIssuerClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(EagerRequestError);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, errorCode, validation.schemas.errorCode);
      expect(publicKeyProvider.getPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(stubs.credentialRequest);
      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });

    it('should report 600-7 for any other error', async () => {
      const errorCode = ErrorCodes.GidUnavailable;
      const error = new PublicKeyNotFoundError();
      publicKeyProvider.getPublicSigningKey.mockRejectedValueOnce(error);

      await expect(gidIssuerClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(error);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, errorCode, validation.schemas.errorCode);
      expect(publicKeyProvider.getPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).not.toHaveBeenCalled();
      expect(mockedValidateTimestamp).not.toHaveBeenCalled();
      expect(epamClient.reportError).toHaveBeenCalledTimes(1);
      expect(epamClient.reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });
  });
});
