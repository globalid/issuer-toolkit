import '../../test/setup';

import { mocked } from 'ts-jest/utils';

import { accessToken, clientId, clientSecret, stub } from '../../test/stubs';
import { CredentialOffer } from '../common';
import * as epam from '../services/epam';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';
import AccessTokenProvider from './access-token-provider';
import { EpamClient, ERROR_DESCRIPTIONS, ErrorCodes } from './epam-client';

jest.mock('./access-token-provider');
jest.mock('../services/epam');
jest.mock('../utils/epam-credential-offer-factory');

const mockedCreateEpamCredentialOffer = mocked(createEpamCredentialOffer);

describe('EpamClient', () => {
  const threadId = 'some-thread-id';
  let accessTokenProvider: AccessTokenProvider;
  let epamClient: EpamClient;
  const mockedEpamService = epam as jest.Mocked<typeof epam>;

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

  describe('#createProofRequest', () => {
    it('should request create proof to EPAM', async () => {
      const proofRequest = stub<epam.EpamCreateProofRequestBody>();
      const proofRequestResponse = stub<epam.EpamCreateProofRequestResponse>();
      const mockedCreatedProofRequest = mockedEpamService.createProofRequest.mockResolvedValue(proofRequestResponse);

      const result: epam.EpamCreateProofRequestResponse = await epamClient.createProofRequest(proofRequest);

      expect(result).toEqual(proofRequestResponse);
      expect(mockedCreatedProofRequest).toHaveBeenCalledWith(accessToken, proofRequest);
    });
  });
});
