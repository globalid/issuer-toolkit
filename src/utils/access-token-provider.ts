import * as auth from '../services/auth';

export class AccessTokenProvider {
  constructor (readonly clientId: string, readonly clientSecret: string, gidApiHost: string = 'api.global.id') {
    // TODO: validate parameters
    auth.init(`https://${gidApiHost}`);
  }

  async getAccessToken (): Promise<string> {
    const authTokenResponse: auth.AuthTokenResponse = await auth.issueTokens({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });
    return authTokenResponse.access_token;
  }
}

export default AccessTokenProvider;
