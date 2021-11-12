import { accessToken, clientId, clientSecret } from '../../../test/stubs';

export default jest.fn(() => ({
  clientId,
  clientSecret,
  getAccessToken: jest.fn().mockResolvedValue(accessToken)
}));
