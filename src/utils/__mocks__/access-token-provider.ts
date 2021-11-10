import { accessToken, clientId, clientSecret } from '../../../test/stubs';

const mockedGetAccessToken = jest.fn().mockResolvedValue(accessToken);

const mock = jest.fn().mockImplementation(() => ({
  clientId,
  clientSecret,
  getAccessToken: mockedGetAccessToken
}));

export default mock;
