import '../../test/setup';

import * as stubs from '../../test/stubs';
import * as validation from '../utils/validation';
import AccessTokenProvider from './access-token-provider';
import EpamClient from './epam-client';
import FileUploader from './file-uploader';
import { GidIssuerClient } from './gid-issuer-client';
import { PublicKeyProvider } from './public-key-provider';
import * as gidIssuerClientFactory from './gid-issuer-client-factory';

jest.mock('../utils/validation');

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

const mockedGetPublicEncryptionKey = jest.fn().mockResolvedValue(stubs.publicEncryptionKey);
const mockedGetPublicSigningKey = jest.fn().mockResolvedValue(stubs.publicSigningKey);
jest.mock('./public-key-provider', () => ({
  PublicKeyProvider: jest.fn(() => ({
    getPublicEncryptionKey: mockedGetPublicEncryptionKey,
    getPublicSigningKey: mockedGetPublicSigningKey
  }))
}));

const MockedAccessTokenProvider = jest.mocked(AccessTokenProvider);
const MockedEpamClient = jest.mocked(EpamClient);
const MockedFileUploader = jest.mocked(FileUploader);
const MockedPublicKeyProvider = jest.mocked(PublicKeyProvider);
const mockedValidation = jest.mocked(validation);

describe('createGidIssuerClient', () => {
  let gidIssuerClient: GidIssuerClient;

  it('should instantiate dependencies', () => {
    gidIssuerClient = gidIssuerClientFactory.createGidIssuerClient(stubs.clientId, stubs.clientSecret);

    expect(gidIssuerClient).toBeInstanceOf(GidIssuerClient);
    expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.clientId, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.clientSecret, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, undefined, validation.schemas.gidIssuerClientOptions);
    expect(MockedAccessTokenProvider).toHaveBeenCalledTimes(1);
    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(stubs.clientId, stubs.clientSecret, undefined);
    expect(MockedEpamClient).toHaveBeenCalledTimes(1);
    // TODO: improve assertion
    expect(MockedEpamClient).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(MockedFileUploader).toHaveBeenCalledTimes(1);
    // TODO: improve assertion
    expect(MockedFileUploader).toHaveBeenCalledWith(expect.anything(), undefined);
    expect(MockedPublicKeyProvider).toHaveBeenCalledTimes(1);
    expect(MockedPublicKeyProvider).toHaveBeenCalledWith(undefined);
  });

  it('should pass base URL options', () => {
    jest.clearAllMocks();
    const baseApiUrl = 'https://api.globalid.dev';
    const baseSsiUrl = 'https://ssi.globalid.dev';
    const baseAuthUrl = 'https://auth.globalid.dev';
    const options: gidIssuerClientFactory.GidIssuerClientOptions = { baseApiUrl, baseSsiUrl, baseAuthUrl };

    gidIssuerClient = gidIssuerClientFactory.createGidIssuerClient(stubs.clientId, stubs.clientSecret, options);

    expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.clientId, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.clientSecret, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, options, validation.schemas.gidIssuerClientOptions);
    expect(MockedAccessTokenProvider).toHaveBeenCalledTimes(1);
    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(stubs.clientId, stubs.clientSecret, baseAuthUrl);
    expect(MockedEpamClient).toHaveBeenCalledTimes(1);
    // TODO: improve assertion
    expect(MockedEpamClient).toHaveBeenCalledWith(expect.anything(), baseSsiUrl);
    expect(MockedFileUploader).toHaveBeenCalledTimes(1);
    // TODO: improve assertion
    expect(MockedFileUploader).toHaveBeenCalledWith(expect.anything(), baseApiUrl);
    expect(MockedPublicKeyProvider).toHaveBeenCalledTimes(1);
    expect(MockedPublicKeyProvider).toHaveBeenCalledWith(baseApiUrl);
  });
});
