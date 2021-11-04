import { mocked } from 'ts-jest/utils';

import { accessToken, clientId, clientSecret, stub } from '../../test/stubs';
import { GidCredentialOffer } from '../common';
import * as epam from '../services/epam';
import AccessTokenProvider from '../utils/access-token-provider';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';
import { EpamClient, ERROR_DESCRIPTIONS, ErrorCodes } from './epam-client';

jest.mock('../services/epam');
const mockedGetAccessToken = jest.fn().mockResolvedValue(accessToken);
jest.mock('../utils/access-token-provider', () =>
  jest.fn(() => ({
    clientId,
    clientSecret,
    getAccessToken: mockedGetAccessToken
  }))
);
jest.mock('../utils/epam-credential-offer-factory');

const mockedCreateEpamCredentialOffer = mocked(createEpamCredentialOffer);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EpamClient', () => {
  const threadId = 'some-thread-id';
  let accessTokenProvider: AccessTokenProvider;
  let epamClient: EpamClient;

  beforeEach(() => {
    accessTokenProvider = new AccessTokenProvider(clientId, clientSecret);
    epamClient = new EpamClient(accessTokenProvider);
  });

  describe('#offerCredential', () => {
    it('should not throw when offering valid credential', async () => {
      const offer = stub<GidCredentialOffer>();
      const epamOffer = stub<epam.EpamCreateCredentialsOfferV2>();
      mockedCreateEpamCredentialOffer.mockReturnValueOnce(epamOffer);

      await expect(epamClient.sendOffer(offer)).resolves.toBeUndefined();
      expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamCredentialOffer).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamCredentialOffer).toHaveBeenCalledWith(offer);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledTimes(1);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, epamOffer);
    });
  });

  describe('#reportError', () => {
    it('should report error to EPAM', async () => {
      const errorCode = ErrorCodes.GLOBALID_UNAVAILABLE;

      await expect(epamClient.reportError(threadId, ErrorCodes.GLOBALID_UNAVAILABLE)).resolves.toBeUndefined();
      expect(mockedGetAccessToken).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledWith(accessToken, {
        code: errorCode,
        description: ERROR_DESCRIPTIONS[errorCode],
        thread_id: threadId
      });
    });
  });
});
