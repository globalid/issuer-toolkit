import * as auth from '../services/auth';

export class AccessTokenProvider {
  #clientId: string;
  #clientSecret: string;

  constructor(clientId: string, clientSecret: string, gidApiHost = 'api.global.id') {
    // TODO: validate parameters
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
    auth.init(`https://${gidApiHost}`);
  }

  get clientId(): string {
    return this.#clientId;
  }

  get clientSecret(): string {
    return this.#clientSecret;
  }

  async getAccessToken(): Promise<string> {
    const authTokenResponse: auth.AuthTokenResponse = await auth.issueTokens({
      client_id: this.#clientId,
      client_secret: this.#clientSecret,
      grant_type: 'client_credentials'
    });
    return authTokenResponse.access_token;
  }
}

export default AccessTokenProvider;
