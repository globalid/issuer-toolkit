import nock from 'nock';
import { DEFAULT_BASE_API_URL, DEFAULT_BASE_AUTH_URL, DEFAULT_BASE_SSI_URL } from '..';

export function clearMocks() {
  nock.cleanAll();
}

export function mockGetAccessToken(accessToken = 'mock.access.token', baseuAuthUrl = DEFAULT_BASE_AUTH_URL): void {
  nock(baseuAuthUrl).post('/realms/globalid/protocol/openid-connect/token').reply(200, {
    access_token: accessToken
  });
}

export function mockReportError(baseSsiUrl = DEFAULT_BASE_SSI_URL): void {
  mockGetAccessToken();
  nock(baseSsiUrl).post('/v2/aries-management/external-party/credentials/error-reports').reply(204);
}

export function mockSendOffer(error?: string | object, baseSsiUrl = DEFAULT_BASE_SSI_URL): void {
  mockGetAccessToken();
  const interceptor = nock(baseSsiUrl).post('/v2/aries-management/external-party/credentials/offers');
  if (error == null) {
    interceptor.reply(204);
  } else {
    interceptor.replyWithError(error);
  }
}

export function mockUploadFile(gidUuid: string, publicKey: string, baseApiUrl = DEFAULT_BASE_API_URL): void {
  mockPublicKeyProvider(gidUuid, publicKey, baseApiUrl);

  mockGetAccessToken();

  const uploadUrl = 'http://example.com/upload';
  nock(baseApiUrl)
    .post('/v2/upload')
    .reply(201, [
      {
        s3_upload_url: uploadUrl,
        s3_upload_fields: {
          key: 'foo.txt'
        },
        base_serve_url: 'http://example.com/files'
      }
    ]);

  nock(uploadUrl).post('/').reply(204);
}

function mockPublicKeyProvider(gidUuid: string, publicKey: string, baseApiUrl = DEFAULT_BASE_API_URL): void {
  nock(baseApiUrl).get(`/v1/identities/${gidUuid}`).reply(200, {
    public_signing_key: publicKey,
    public_encryption_key: publicKey
  });
}

export function mockValidateRequest(
  gidUuid: string,
  publicKey: string,
  baseApiUrl = DEFAULT_BASE_API_URL,
  baseSsiUrl = DEFAULT_BASE_SSI_URL
): void {
  mockPublicKeyProvider(gidUuid, publicKey, baseApiUrl);
  mockReportError(baseSsiUrl);
}

export default {
  clearMocks,
  mockGetAccessToken,
  mockReportError,
  mockSendOffer,
  mockUploadFile,
  mockValidateRequest
};
