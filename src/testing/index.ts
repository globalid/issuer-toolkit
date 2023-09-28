import nock from 'nock';
import { DEFAULT_BASE_API_URL, DEFAULT_BASE_AUTH_URL, DEFAULT_BASE_SSI_URL } from '..';

export const gidUrls = {
  baseApiUrl: DEFAULT_BASE_API_URL,
  baseuAuthUrl: DEFAULT_BASE_AUTH_URL,
  baseSsiUrl: DEFAULT_BASE_SSI_URL
};

export type GidUrlsI = Partial<typeof gidUrls>;

export function clearMocks() {
  nock.cleanAll();
}

export function mockGetAccessToken(accessToken = 'mock.access.token', urlOverride?: GidUrlsI): void {
  const { baseuAuthUrl } = getUrls(urlOverride);
  nock(baseuAuthUrl).post('/realms/globalid/protocol/openid-connect/token').reply(200, {
    access_token: accessToken
  });
}

export function mockReportError(urlOverride?: GidUrlsI): void {
  const { baseuAuthUrl, baseSsiUrl } = getUrls(urlOverride);
  mockGetAccessToken(undefined, { baseuAuthUrl });
  nock(baseSsiUrl).post('/v2/aries-management/external-party/credentials/error-reports').reply(204);
}

export function mockSendOffer(error?: string | object, urlOverride?: GidUrlsI): void {
  const { baseSsiUrl } = getUrls(urlOverride);
  mockGetAccessToken(undefined, urlOverride);
  const interceptor = nock(baseSsiUrl).post('/v2/aries-management/external-party/credentials/offers');
  if (error == null) {
    interceptor.reply(204);
  } else {
    interceptor.replyWithError(error);
  }
}

export function mockSendDirectOffer(
  { error, response }: { error?: string | object; response?: object },
  urlOverride?: GidUrlsI
): void {
  const { baseSsiUrl } = getUrls(urlOverride);
  mockGetAccessToken(undefined, urlOverride);
  const interceptor = nock(baseSsiUrl).post('/v2/aries-management/external-party/credentials/direct-offers');
  if (error == null) {
    interceptor.reply(204, response);
  } else {
    interceptor.replyWithError(error);
  }
}

export function mockUploadFile(gidUuid: string, publicKey: string, urlOverride?: GidUrlsI): void {
  const { baseApiUrl } = getUrls(urlOverride);
  mockPublicKeyProvider(gidUuid, publicKey, urlOverride);

  mockGetAccessToken(undefined, urlOverride);

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

function mockPublicKeyProvider(gidUuid: string, publicKey: string, urlOverride?: GidUrlsI): void {
  const { baseApiUrl } = getUrls(urlOverride);
  nock(baseApiUrl).get(`/v1/identities/${gidUuid}`).reply(200, {
    public_signing_key: publicKey,
    public_encryption_key: publicKey
  });
}

export function mockValidateRequest(gidUuid: string, publicKey: string, urlOverride?: GidUrlsI): void {
  mockPublicKeyProvider(gidUuid, publicKey, urlOverride);
  mockReportError(urlOverride);
}

function getUrls(optGidUrls: GidUrlsI = gidUrls): typeof gidUrls {
  return {
    ...gidUrls,
    ...optGidUrls
  };
}

export default {
  clearMocks,
  mockGetAccessToken,
  mockReportError,
  mockSendOffer,
  mockUploadFile,
  mockValidateRequest
};
