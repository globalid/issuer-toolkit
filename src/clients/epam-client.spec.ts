import { ERROR_DESCRIPTIONS } from '../error';
import * as epam from '../services/epam';
import AccessTokenProvider from '../utils/access-token-provider';
import { EpamClient, ErrorCodes, GidCredentialOffer, PrimitiveClaimValueType } from './epam-client';

const accessToken = 'some-access-token';

jest.mock('../services/epam');
jest.mock('../utils/access-token-provider', () => {
  return function () {
    return {
      getAccessToken: () => accessToken
    };
  };
});

describe('EpamClient', () => {
  const accessTokenProvider = new AccessTokenProvider('some-client-id', 'some-client-secret');
  const epamClient = new EpamClient(accessTokenProvider);
  const threadId = 'some-thread-id';

  describe('#offerCredential', () => {
    it('should not throw when offering valid credential', async () => {
      const contextIri = 'https://ssi.globalid.construction/v1/schema-registry/contexts/Person/versions/1';
      const subjectType = 'Person';
      const offer: GidCredentialOffer = {
        threadId,
        contextIri,
        subjectType,
        claims: {
          givenName: {
            type: PrimitiveClaimValueType.String,
            value: 'Harry'
          },
          familyName: {
            type: PrimitiveClaimValueType.String,
            value: 'Potter'
          },
          birthDate: {
            type: PrimitiveClaimValueType.Date,
            value: '1980-07-31'
          }
        }
      };

      await expect(epamClient.sendOffer(offer)).resolves.toBeUndefined();
      expect(epam.createCredentialOfferV2).toHaveBeenCalledTimes(1);
      expect(epam.createCredentialOfferV2).toHaveBeenCalledWith(accessToken, {
        thread_id: threadId,
        schema_url: contextIri,
        schema_type: subjectType,
        credential_attributes: [
          {
            name: 'givenName',
            value: 'Harry',
            mime_type: 'string'
          },
          {
            name: 'familyName',
            value: 'Potter',
            mime_type: 'string'
          },
          {
            name: 'birthDate',
            value: '1980-07-31',
            mime_type: 'date'
          }
        ]
      });
    });
  });

  describe('#reportError', () => {
    it('should report error to EPAM', async () => {
      const errorCode = ErrorCodes.GLOBALID_UNAVAILABLE;

      await expect(epamClient.reportError(threadId, ErrorCodes.GLOBALID_UNAVAILABLE)).resolves.toBeUndefined();
      expect(epam.createErrorReport).toHaveBeenCalledTimes(1);
      expect(epam.createErrorReport).toHaveBeenCalledWith(accessToken, {
        code: errorCode,
        description: ERROR_DESCRIPTIONS[errorCode],
        thread_id: threadId
      });
    });
  });
});
