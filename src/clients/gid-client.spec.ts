import '../../test/setup';

import { mocked } from 'ts-jest/utils';

import * as stubs from '../../test/stubs';
import crypto from '../utils/crypto';
import { validateTimestamp } from '../utils/validate-timestamp';
import * as validation from '../utils/validation';
import { verifySignature } from '../utils/verify-signature';
import AccessTokenProvider from './access-token-provider';
import EpamClient from './epam-client';
import FileUploader from './file-uploader';
import { CredentialOffer, ErrorCodes, FileObject, FileType, GidClient, GidClientOptions } from './gid-client';
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

const mockedGetAccessToken = jest.fn().mockResolvedValue(stubs.accessToken);
jest.mock('./access-token-provider', () =>
  jest.fn(() => ({
    clientId: stubs.clientId,
    clientSecret: stubs.clientSecret,
    getAccessToken: mockedGetAccessToken
  }))
);

jest.mock('./epam-client');

const mockedUploadEncryptedFile = jest.fn();
jest.mock('./file-uploader', () =>
  jest.fn(() => ({
    uploadEncryptedFile: mockedUploadEncryptedFile
  }))
);

const mockedGetPublicEncryptionKey = jest.fn().mockResolvedValue(stubs.publicKey);
const mockedGetPublicSigningKey = jest.fn().mockResolvedValue(stubs.publicKey);
jest.mock('./public-key-provider', () => ({
  PublicKeyProvider: jest.fn(() => ({
    getPublicEncryptionKey: mockedGetPublicEncryptionKey,
    getPublicSigningKey: mockedGetPublicSigningKey
  }))
}));

const { PublicKeyNotFoundError } = jest.requireActual('./public-key-provider');
const { EagerRequestError, StaleRequestError } = jest.requireActual('../utils/validate-timestamp');
const { InvalidSignatureError } = jest.requireActual('../utils/verify-signature');

const MockedAccessTokenProvider = mocked(AccessTokenProvider);
const MockedEpamClient = mocked(EpamClient);
const MockedFilerUploader = mocked(FileUploader);
const MockedPublicKeyProvider = mocked(PublicKeyProvider);
const mockedValidateTimestamp = mocked(validateTimestamp);
const mockedValidation = mocked(validation);
const mockedVerifySignature = mocked(verifySignature);
const mockedEncrypt = mocked(crypto.encrypt);
const mockedSha512Sum = mocked(crypto.sha512sum);

describe('GidClient', () => {
  let gidClient: GidClient;

  beforeEach(() => {
    gidClient = new GidClient(stubs.clientId, stubs.clientSecret);
  });

  it('should instantiate dependencies', () => {
    expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.clientId, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.clientSecret, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, undefined, validation.schemas.gidClientOptions);
    expect(MockedAccessTokenProvider).toHaveBeenCalledTimes(1);
    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(stubs.clientId, stubs.clientSecret, undefined);
    expect(MockedEpamClient).toHaveBeenCalledTimes(1);
    // TODO: improve assertion
    expect(MockedEpamClient).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(MockedFilerUploader).toHaveBeenCalledTimes(1);
    // TODO: improve assertion
    expect(MockedFilerUploader).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(MockedPublicKeyProvider).toHaveBeenCalledTimes(1);
    expect(MockedPublicKeyProvider).toHaveBeenCalledWith(undefined);
  });

  it('should pass base URL options', () => {
    jest.clearAllMocks();
    const baseApiUrl = 'https://api.globalid.dev';
    const baseSsiUrl = 'https://ssi.globalid.dev';
    const options: GidClientOptions = { baseApiUrl, baseSsiUrl };

    new GidClient(stubs.clientId, stubs.clientSecret, options);

    expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.clientId, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.clientSecret, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, options, validation.schemas.gidClientOptions);
    expect(MockedAccessTokenProvider).toHaveBeenCalledTimes(1);
    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(stubs.clientId, stubs.clientSecret, baseApiUrl);
    // TODO: improve assertion
    expect(MockedEpamClient).toHaveBeenCalledTimes(1);
    expect(MockedEpamClient).toHaveBeenCalledWith(expect.anything(), baseSsiUrl);
    // TODO: improve assertion
    expect(MockedFilerUploader).toHaveBeenCalledWith(expect.anything(), baseApiUrl);
    expect(MockedPublicKeyProvider).toHaveBeenCalledTimes(1);
    expect(MockedPublicKeyProvider).toHaveBeenCalledWith(baseApiUrl);
  });

  it('should expose client credentials', () => {
    expect(gidClient.clientId).toEqual(stubs.clientId);
    expect(gidClient.clientSecret).toEqual(stubs.clientSecret);
  });

  describe('#getAccessToken', () => {
    it('should delegate to AccessTokenProvider', async () => {
      const result = await gidClient.getAccessToken();

      expect(result).toEqual(stubs.accessToken);
      expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('#reportError', () => {
    it('should delegate to EpamClient', async () => {
      const errorCode = ErrorCodes.GidUnavailable;

      await gidClient.reportError(stubs.threadId, errorCode);

      expect(mockedValidation.validate).toHaveBeenCalledTimes(5);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(5, errorCode, validation.schemas.errorCode);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });
  });

  describe('#sendOffer', () => {
    it('should delegate to EpamClient', async () => {
      const offer = stubs.stub<CredentialOffer>();

      await gidClient.sendOffer(offer);

      expect(mockedValidation.validate).toHaveBeenCalledTimes(4);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, offer, validation.schemas.credentialOffer);
      expect(MockedEpamClient.mock.instances[0].sendOffer).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].sendOffer).toHaveBeenCalledWith(offer);
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
      mockedUploadEncryptedFile.mockResolvedValueOnce(url);
      mockedSha512Sum.mockReturnValueOnce(sha512sum);

      const result = await gidClient.uploadFile(stubs.gidUuid, fileObject);

      expect(result).toEqual({ url, decryptionKey, name, type, sha512sum });
      expect(mockedValidation.validate).toHaveBeenCalledTimes(5);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.gidUuid, validation.schemas.uuid);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(5, fileObject, validation.schemas.fileObject);
      expect(mockedEncrypt).toHaveBeenCalledTimes(1);
      expect(mockedEncrypt).toHaveBeenCalledWith(content);
      expect(mockedUploadEncryptedFile).toHaveBeenCalledTimes(1);
      expect(mockedUploadEncryptedFile).toHaveBeenCalledWith(name, type, encryptedContent);
      expect(mockedSha512Sum).toHaveBeenCalledTimes(1);
      expect(mockedSha512Sum).toHaveBeenCalledWith(content);
    });
  });

  describe('#validateRequest', () => {
    it('should not report error when request is valid', async () => {
      await gidClient.validateRequest(stubs.credentialRequest);

      expect(mockedValidation.validate).toHaveBeenCalledTimes(4);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedGetPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(stubs.credentialRequest);
      expect(MockedEpamClient.mock.instances[0].reportError).not.toHaveBeenCalled();
    });

    it('should report 600-16 on InvalidSignatureError', async () => {
      const errorCode = ErrorCodes.RequestValidationFailed;
      const error = new InvalidSignatureError();
      mockedVerifySignature.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(error);
      expect(mockedValidation.validate).toHaveBeenCalledTimes(6);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(5, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(6, errorCode, validation.schemas.errorCode);
      expect(mockedGetPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).not.toHaveBeenCalled();
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });

    it('should report 600-16 on StaleRequestError', async () => {
      const errorCode = ErrorCodes.RequestValidationFailed;
      const error = new StaleRequestError('', '');
      mockedValidateTimestamp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(error);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(5, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(6, errorCode, validation.schemas.errorCode);
      expect(mockedGetPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(stubs.credentialRequest);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });

    it('should report 600-16 on EagerRequestError', async () => {
      const errorCode = ErrorCodes.RequestValidationFailed;
      const error = new EagerRequestError('', '');
      mockedValidateTimestamp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(EagerRequestError);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(5, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(6, errorCode, validation.schemas.errorCode);
      expect(mockedGetPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(stubs.credentialRequest, stubs.publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(stubs.credentialRequest);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });

    it('should report 600-7 for any other error', async () => {
      const errorCode = ErrorCodes.GidUnavailable;
      const error = new PublicKeyNotFoundError();
      mockedGetPublicSigningKey.mockRejectedValueOnce(error);

      await expect(gidClient.validateRequest(stubs.credentialRequest)).rejects.toThrow(error);
      // prettier-ignore
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(4, stubs.credentialRequest, validation.schemas.credentialRequest);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(5, stubs.threadId, validation.schemas.requiredString);
      expect(mockedValidation.validate).toHaveBeenNthCalledWith(6, errorCode, validation.schemas.errorCode);
      expect(mockedGetPublicSigningKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).not.toHaveBeenCalled();
      expect(mockedValidateTimestamp).not.toHaveBeenCalled();
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(stubs.threadId, errorCode);
    });
  });
});
