import '../../test/setup';

import { mocked } from 'ts-jest/utils';

import * as stubs from '../../test/stubs';
import * as validation from '../utils/validation';
import AccessTokenProvider from './access-token-provider';
import EpamClient from './epam-client';
import FileUploader from './file-uploader';
import { GidClient } from './gid-client';
import { PublicKeyProvider } from './public-key-provider';
import * as gidClientFactory from './gid-client-factory';

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

const mockedGetPublicEncryptionKey = jest.fn().mockResolvedValue(stubs.publicKey);
const mockedGetPublicSigningKey = jest.fn().mockResolvedValue(stubs.publicKey);
jest.mock('./public-key-provider', () => ({
  PublicKeyProvider: jest.fn(() => ({
    getPublicEncryptionKey: mockedGetPublicEncryptionKey,
    getPublicSigningKey: mockedGetPublicSigningKey
  }))
}));

const MockedAccessTokenProvider = mocked(AccessTokenProvider);
const MockedEpamClient = mocked(EpamClient);
const MockedFileUploader = mocked(FileUploader);
const MockedPublicKeyProvider = mocked(PublicKeyProvider);
const mockedValidation = mocked(validation);

describe('createGidClient', () => {
  let gidClient: GidClient;

  it('should instantiate dependencies', () => {
    gidClient = gidClientFactory.createGidClient(stubs.clientId, stubs.clientSecret);

    expect(gidClient).toBeInstanceOf(GidClient);
    expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.clientId, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.clientSecret, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, undefined, validation.schemas.gidClientOptions);
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
    const options: gidClientFactory.GidClientOptions = { baseApiUrl, baseSsiUrl };

    gidClient = gidClientFactory.createGidClient(stubs.clientId, stubs.clientSecret, options);

    expect(mockedValidation.validate).toHaveBeenCalledTimes(3);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, stubs.clientId, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, stubs.clientSecret, validation.schemas.requiredString);
    expect(mockedValidation.validate).toHaveBeenNthCalledWith(3, options, validation.schemas.gidClientOptions);
    expect(MockedAccessTokenProvider).toHaveBeenCalledTimes(1);
    expect(MockedAccessTokenProvider).toHaveBeenCalledWith(stubs.clientId, stubs.clientSecret, baseApiUrl);
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
