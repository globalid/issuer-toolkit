import '../../test/setup';

import { mocked } from 'ts-jest/utils';

import { accessToken, clientId, clientSecret, stub } from '../../test/stubs';
import { CredentialOffer } from '../common';
import * as epam from '../services/epam';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';
import AccessTokenProvider from './access-token-provider';
import { EpamClient, ERROR_DESCRIPTIONS, ErrorCodes } from './epam-client';
import { AxiosError, AxiosResponse } from 'axios';

jest.mock('./access-token-provider');
jest.mock('../services/epam');
jest.mock('../utils/epam-credential-offer-factory');

const mockedCreateEpamCredentialOffer = mocked(createEpamCredentialOffer);

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
      const offer = stub<CredentialOffer>();
      const epamOffer = stub<epam.EpamCreateCredentialsOfferV2>();
      mockedCreateEpamCredentialOffer.mockReturnValueOnce(epamOffer);

      await epamClient.sendOffer(offer);

      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamCredentialOffer).toHaveBeenCalledTimes(1);
      expect(mockedCreateEpamCredentialOffer).toHaveBeenCalledWith(offer);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledTimes(1);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, epamOffer);
    });

    it('should retry send the offer', async () => {
      jest.useFakeTimers()
      const offer = stub<CredentialOffer>();
      const epamOffer = stub<epam.EpamCreateCredentialsOfferV2>();
      const axiosResponse = stub<AxiosResponse>({ status: 404, data: { error_code: 'ERR_CREDENTIAL_EXCHANGE_RECORD_NOT_FOUND' } })
      const axiosError = stub<AxiosError>({ response: axiosResponse });
      const createCredentialOfferV2Mock = jest.spyOn(epam, 'createCredentialOfferV2')
      const sendOfferMock = jest.spyOn(EpamClient.prototype as any, 'sendOfferWithRetry')
      mockedCreateEpamCredentialOffer.mockReturnValueOnce(epamOffer);
      createCredentialOfferV2Mock.mockRejectedValue(axiosError)

      await epamClient.sendOffer(offer);
      jest.runAllTimers()

      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, epamOffer);
      expect(sendOfferMock).toHaveBeenCalledTimes(2)
    });
  });

  describe('#reportError', () => {
    it('should report error to EPAM', async () => {
      const errorCode = ErrorCodes.GidUnavailable;

      await epamClient.reportError(threadId, ErrorCodes.GidUnavailable);

      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledWith(accessToken, {
        code: errorCode,
        description: ERROR_DESCRIPTIONS[errorCode],
        thread_id: threadId
      });
    });
  });
});
