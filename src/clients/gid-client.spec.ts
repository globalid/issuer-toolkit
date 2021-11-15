import { mocked } from 'ts-jest/utils';

import { accessToken, clientId, clientSecret, gidUuid, publicKey, stub, threadId } from '../../test/stubs';
import { FileType } from '../common';
import crypto from '../utils/crypto';
import AccessTokenProvider from '../utils/access-token-provider';
import FileUploader from '../utils/file-uploader';
import { PublicKeyProvider } from '../utils/public-key-provider';
import { validateTimestamp } from '../utils/validate-timestamp';
import { verifySignature } from '../utils/verify-signature';
import EpamClient from './epam-client';
import { ErrorCodes, GidClient, GidCredentialOffer, GidCredentialRequest } from './gid-client';

const mockedGetAccessToken = jest.fn().mockResolvedValue(accessToken);
jest.mock('../utils/access-token-provider', () =>
  jest.fn(() => ({
    clientId,
    clientSecret,
    getAccessToken: mockedGetAccessToken
  }))
);
jest.mock('../utils/crypto');
const mockedUploadEncryptedFile = jest.fn();
jest.mock('../utils/file-uploader', () =>
  jest.fn(() => ({
    uploadEncryptedFile: mockedUploadEncryptedFile
  }))
);
const mockedGetPublicKey = jest.fn().mockResolvedValue(publicKey);
jest.mock('../utils/public-key-provider', () => ({
  PublicKeyProvider: jest.fn(() => ({
    getPublicKey: mockedGetPublicKey
  }))
}));
jest.mock('../utils/validate-timestamp', () => ({
  ...jest.requireActual('../utils/validate-timestamp'),
  validateTimestamp: jest.fn()
}));
jest.mock('../utils/verify-signature', () => ({
  ...jest.requireActual('../utils/verify-signature'),
  verifySignature: jest.fn()
}));
jest.mock('./epam-client');

const { PublicKeyNotFoundError } = jest.requireActual('../utils/public-key-provider');
const { EagerRequestError, StaleRequestError } = jest.requireActual('../utils/validate-timestamp');
const { InvalidSignatureError } = jest.requireActual('../utils/verify-signature');

const MockedAccessTokenProvider = mocked(AccessTokenProvider);
const MockedEpamClient = mocked(EpamClient);
const MockedFilerUploader = mocked(FileUploader);
const MockedPublicKeyProvider = mocked(PublicKeyProvider);
const mockedValidateTimestamp = mocked(validateTimestamp);
const mockedVerifySignature = mocked(verifySignature);
const mockedEncrypt = mocked(crypto.encrypt);
const mockedSha512Sum = mocked(crypto.sha512sum);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GidClient', () => {
  let gidClient: GidClient;

  beforeEach(() => {
    gidClient = new GidClient(clientId, clientSecret);
  });

  it('should instantiate dependencies', () => {
    expect(MockedAccessTokenProvider).toHaveBeenCalledTimes(1);
    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(clientId, clientSecret, undefined);
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
    const baseApiUrl = 'https://api.globalid.dev';
    const baseSsiUrl = 'https://ssi.globalid.dev';

    new GidClient(clientId, clientSecret, { baseApiUrl, baseSsiUrl });

    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(clientId, clientSecret, baseApiUrl);
    // TODO: improve assertion
    expect(MockedEpamClient).toHaveBeenCalledWith(expect.anything(), baseSsiUrl);
    // TODO: improve assertion
    expect(MockedFilerUploader).toHaveBeenCalledWith(expect.anything(), baseApiUrl);
    expect(MockedPublicKeyProvider).toHaveBeenCalledWith(baseApiUrl);
  });

  it('should expose client credentials', () => {
    expect(gidClient.clientId).toEqual(clientId);
    expect(gidClient.clientSecret).toEqual(clientSecret);
  });

  describe('#getAccessToken', () => {
    it('should delegate to AccessTokenProvider', async () => {
      const result = await gidClient.getAccessToken();

      expect(result).toEqual(accessToken);
      expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('#reportError', () => {
    it('should delegate to EpamClient', async () => {
      const errorCode = ErrorCodes.GidUnavailable;

      await gidClient.reportError(threadId, errorCode);

      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(threadId, errorCode);
    });
  });

  describe('#sendOffer', () => {
    it('should delegate to EpamClient', async () => {
      const offer = stub<GidCredentialOffer>();

      await gidClient.sendOffer(offer);

      expect(MockedEpamClient.mock.instances[0].sendOffer).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].sendOffer).toHaveBeenCalledWith(offer);
    });
  });

  describe('#uploadFile', () => {
    it('should encrypt file and delegate upload to FileUploader', async () => {
      const name = 'foo.jpg';
      const type = FileType.JPEG;
      const content = Buffer.from('definitely a valid image');
      const encryptedContent = Buffer.from('lorem ipsum dolor sit amet');
      const url = 'https://example.com/uploads/some-key';
      const decryptionKey = 'foobar';
      const sha512sum = 'abcdefg1234567';
      mockedEncrypt.mockReturnValueOnce([encryptedContent, decryptionKey]);
      mockedUploadEncryptedFile.mockResolvedValueOnce(url);
      mockedSha512Sum.mockReturnValueOnce(sha512sum);

      const result = await gidClient.uploadFile(gidUuid, {
        type: type,
        name: name,
        content: content
      });

      expect(result).toEqual({
        url,
        decryptionKey,
        type: type,
        sha512sum
      });
      expect(mockedGetPublicKey).toHaveBeenCalledTimes(1);
      expect(mockedGetPublicKey).toHaveBeenCalledWith(gidUuid);
      expect(mockedEncrypt).toHaveBeenCalledTimes(1);
      expect(mockedEncrypt).toHaveBeenCalledWith(content, publicKey);
      expect(mockedUploadEncryptedFile).toHaveBeenCalledTimes(1);
      expect(mockedUploadEncryptedFile).toHaveBeenCalledWith(name, type, encryptedContent);
      expect(mockedSha512Sum).toHaveBeenCalledTimes(1);
      expect(mockedSha512Sum).toHaveBeenCalledWith(content);
    });
  });

  describe('#validateRequest', () => {
    const request = stub<GidCredentialRequest>({ threadId, gidUuid });

    it('should not report error when request is valid', async () => {
      await gidClient.validateRequest(request);

      expect(mockedGetPublicKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(request, publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(request);
      expect(MockedEpamClient.mock.instances[0].reportError).not.toHaveBeenCalled();
    });

    it('should report 600-16 on InvalidSignatureError', async () => {
      const error = new InvalidSignatureError();
      mockedVerifySignature.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidClient.validateRequest(request)).rejects.toThrow(error);
      expect(mockedGetPublicKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(request, publicKey);
      expect(mockedValidateTimestamp).not.toHaveBeenCalled();
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(
        threadId,
        ErrorCodes.RequestValidationFailed
      );
    });

    it('should report 600-16 on StaleRequestError', async () => {
      const error = new StaleRequestError('', '');
      mockedValidateTimestamp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidClient.validateRequest(request)).rejects.toThrow(error);
      expect(mockedGetPublicKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(request, publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(request);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(
        threadId,
        ErrorCodes.RequestValidationFailed
      );
    });

    it('should report 600-16 on EagerRequestError', async () => {
      const error = new EagerRequestError('', '');
      mockedValidateTimestamp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(gidClient.validateRequest(request)).rejects.toThrow(EagerRequestError);
      expect(mockedGetPublicKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).toHaveBeenCalledWith(request, publicKey);
      expect(mockedValidateTimestamp).toHaveBeenCalledTimes(1);
      expect(mockedValidateTimestamp).toHaveBeenCalledWith(request);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(
        threadId,
        ErrorCodes.RequestValidationFailed
      );
    });

    it('should report 600-7 for any other error', async () => {
      const error = new PublicKeyNotFoundError();
      mockedGetPublicKey.mockRejectedValueOnce(error);

      await expect(gidClient.validateRequest(request)).rejects.toThrow(error);
      expect(mockedGetPublicKey).toHaveBeenCalledTimes(1);
      expect(mockedVerifySignature).not.toHaveBeenCalled();
      expect(mockedValidateTimestamp).not.toHaveBeenCalled();
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledTimes(1);
      expect(MockedEpamClient.mock.instances[0].reportError).toHaveBeenCalledWith(threadId, ErrorCodes.GidUnavailable);
    });
  });
});
