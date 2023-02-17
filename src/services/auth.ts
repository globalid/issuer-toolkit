import axios from 'axios';
import url from 'url';

let baseUrl: string;

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl;
}

export async function issueTokens(body: IssueTokenRequestBody): Promise<AuthTokenResponse> {
  const response = await axios.request<AuthTokenResponse>({
    url: '/realms/globalid/protocol/openid-connect/token',
    baseURL: baseUrl,
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: new url.URLSearchParams(<Record<string, string>>(<unknown>body))
  });
  return response.data;
}

export interface IssueTokenRequestBody {
  client_id: string;
  client_secret?: string;
  code_verifier?: string;
  grant_type: 'client_credentials' | 'authorization_code' | 'implicit' | 'refresh_token' | 'password';
  refresh_token?: string;
  code?: string;
  redirect_uri?: string;
  globalid?: string;
  password?: string;
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
}
