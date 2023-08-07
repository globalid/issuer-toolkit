import '../../test/setup';

import { accessToken, clientId, clientSecret, stub } from '../../test/stubs';
import { CredentialOffer } from '../common';
import * as epam from '../services/epam';
import createEpamCredentialOffer, { createEpamDirectCredentialOffer } from '../utils/epam-credential-offer-factory';
import AccessTokenProvider from './access-token-provider';
import { EpamClient, ERROR_DESCRIPTIONS, ErrorCodes } from './epam-client';

jest.mock('./access-token-provider');
jest.mock('../services/epam');
jest.mock('../utils/epam-credential-offer-factory');

const mockedCreateEpamCredentialOffer = jest.mocked(createEpamCredentialOffer);
const mockedCreateEpamDirectCredentialOffer = jest.mocked(createEpamDirectCredentialOffer);

describe('EpamClient', () => {
  const threadId = 'some-thread-id';
  let accessTokenProvider: AccessTokenProvider;
  let epamClient: EpamClient;

  beforeEach(() => {
    accessTokenProvider = new AccessTokenProvider(clientId, clientSecret);
    epamClient = new EpamClient(accessTokenProvider);
  });

  describe('#sendOffer', () => {
    const appUuid = 'some-app-uuid';
    it('should not throw when offering valid credential', async () => {
      const offer = stub<CredentialOffer>();
      const epamOffer = stub<epam.EpamCreateCredentialsOfferV2>();
      mockedCreateEpamCredentialOffer.mockReturnValueOnce(epamOffer);
      epamClient.setAppUuid(appUuid);

      await epamClient.sendOffer(offer);

      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamCredentialOffer).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamCredentialOffer).toHaveBeenCalledWith(offer);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledTimes(1);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, epamOffer, appUuid);
    });
  });

  describe('#sendDirectOffer', () => {
    const appUuid = 'some-app-uuid';
    it('should not throw when offering valid credential', async () => {
      const offer = stub<CredentialOffer>();
      const gidUuid = 'gidUuid'
      const epamOffer = stub<epam.EpamCreateDirectCredentialOffer>();
      mockedCreateEpamDirectCredentialOffer.mockReturnValueOnce(epamOffer);
      epamClient.setAppUuid(appUuid);

      await epamClient.sendDirectOffer(gidUuid, offer);

      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamDirectCredentialOffer).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamDirectCredentialOffer).toHaveBeenCalledWith(offer, gidUuid);
      expect(epam.createDirectCredentialOffer).toHaveBeenCalledTimes(1);
      expect(epam.createDirectCredentialOffer).toHaveBeenCalledWith(accessToken, epamOffer, appUuid);
    });
  });

  describe('#reportError', () => {
    const appUuid = 'some-app-uuid';

    it('should report error to EPAM', async () => {
      const errorCode = ErrorCodes.GidUnavailable;
      epamClient.setAppUuid(appUuid);

      await epamClient.reportError(threadId, ErrorCodes.GidUnavailable);

      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledWith(
        accessToken,
        {
          code: errorCode,
          description: ERROR_DESCRIPTIONS[errorCode],
          thread_id: threadId
        },
        appUuid
      );
    });
  });

  describe('#setAppUuid', () => {
    it('should set app uuid', () => {
      const appUuid = 'some-app-uuid';

      epamClient.setAppUuid(appUuid);

      expect(epamClient.getAppUuid()).toEqual(appUuid);
    });
  });

  describe('#getAppUuid', () => {
    it('should get app uuid', () => {
      const appUuid = 'app-uuid';
      epamClient.setAppUuid(appUuid);

      const result = epamClient.getAppUuid();

      expect(result).toBe(appUuid);
    });
  });
});
