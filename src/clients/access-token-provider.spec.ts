import { mocked } from 'ts-jest/utils';

import { stub } from '../../test/stubs';
import * as auth from '../services/auth';
import AccessTokenProvider from './access-token-provider';

jest.mock('../services/auth');

const mockedAuth = mocked(auth);

describe('AccessTokenProvider', () => {
  const accessTokenProvider = new AccessTokenProvider('some-id', 'some-secret');

  describe('#getAccessToken', () => {
    it('should return access token', async () => {
      const accessTokenResponse = stub<auth.AuthTokenResponse>({ access_token: 'some-access-token' });
      mockedAuth.issueTokens.mockResolvedValueOnce(accessTokenResponse);

      const accessToken = await accessTokenProvider.getAccessToken();

      expect(accessToken).toEqual(accessTokenResponse.access_token);
      expect(mockedAuth.issueTokens).toHaveBeenCalledTimes(1);
      expect(mockedAuth.issueTokens).toHaveBeenCalledWith({
        client_id: accessTokenProvider.clientId,
        client_secret: accessTokenProvider.clientSecret,
        grant_type: 'client_credentials'
      });
    });
  });
});
