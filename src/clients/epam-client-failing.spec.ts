/* eslint-disable jest/no-conditional-expect */
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
jest.mock('../common')

const mockedCreateEpamCredentialOffer = mocked(createEpamCredentialOffer);

describe('EpamClient failed cases', () => {
  let accessTokenProvider: AccessTokenProvider;
  let epamClient: EpamClient;

  beforeEach(() => {
    accessTokenProvider = new AccessTokenProvider(clientId, clientSecret);
    epamClient = new EpamClient(accessTokenProvider);
  });

  describe('#offerCredentialFailed', () => {
    const offer = stub<CredentialOffer>();
    const epamOffer = stub<epam.EpamCreateCredentialsOfferV2>();
    
    it('should not retry send the offer because retry limit is reached', async () => {
      const axiosResponse = stub<AxiosResponse>({ status: 404, data: { error_code: 'ERR_CREDENTIAL_EXCHANGE_RECORD_NOT_FOUND' } })
      const axiosError = stub<AxiosError>({ response: axiosResponse });
      const createCredentialOfferV2Mock = jest.spyOn(epam, 'createCredentialOfferV2')
      createCredentialOfferV2Mock.mockRejectedValue(axiosError)
      mockedCreateEpamCredentialOffer.mockReturnValueOnce(epamOffer);
      
      try {
        await epamClient.sendOffer(offer);
      } catch (error: any) {
        expect(error.response.data.error_code).toBe('ERR_CREDENTIAL_EXCHANGE_RECORD_NOT_FOUND');
        expect(error.response.data.retries_number).toBe(0);
      }
      
      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, epamOffer);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledTimes(1)
    });
    
    it('should retry send the offer', async () => {
      const axiosResponse = stub<AxiosResponse>({ status: 404, data: { error_code: 'unknown_error' } })
      const axiosError = stub<AxiosError>({ response: axiosResponse });
      const createCredentialOfferV2Mock = jest.spyOn(epam, 'createCredentialOfferV2')
      createCredentialOfferV2Mock.mockRejectedValue(axiosError)
      mockedCreateEpamCredentialOffer.mockReturnValueOnce(epamOffer);
      
      try {
        await epamClient.sendOffer(offer);
      } catch (error: any) {
        expect(error.response.data.error_code).toBe('unknown_error');
      }

      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, epamOffer);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledTimes(1)
    });
  });
});

