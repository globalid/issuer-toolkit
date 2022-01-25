import nock from 'nock';
import { DEFAULT_BASE_API_URL, DEFAULT_BASE_SSI_URL } from '..';

export function clearMocks() {
  nock.cleanAll();
}

export function mockGetAccessToken(accessToken = 'mock.access.token'): void {
  nock(DEFAULT_BASE_API_URL).post('/v1/auth/token').reply(200, {
    access_token: accessToken
  });
}

export function mockReportError(): void {
  mockGetAccessToken();
  nock(DEFAULT_BASE_SSI_URL).post('/v2/aries-management/external-party/credentials/error-reports').reply(204);
}

export function mockSendOffer(error?: string | object): void {
  mockGetAccessToken();
  const interceptor = nock(DEFAULT_BASE_SSI_URL).post('/v2/aries-management/external-party/credentials/offers');
  if (error == null) {
    interceptor.reply(204);
  } else {
    interceptor.replyWithError(error);
  }
}

export function mockUploadFile(gidUuid: string, publicKey: string): void {
  mockPublicKeyProvider(gidUuid, publicKey);

  mockGetAccessToken();

  const uploadUrl = 'http://example.com/upload';
  nock(DEFAULT_BASE_API_URL)
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

function mockPublicKeyProvider(gidUuid: string, publicKey: string): void {
  nock(DEFAULT_BASE_API_URL).get(`/v1/identities/${gidUuid}`).reply(200, {
    public_signing_key: publicKey,
    public_encryption_key: publicKey
  });
}

export function mockValidateRequest(gidUuid: string, publicKey: string): void {
  mockPublicKeyProvider(gidUuid, publicKey);
  mockReportError();
}

export default {
  clearMocks,
  mockGetAccessToken,
  mockReportError,
  mockSendOffer,
  mockUploadFile,
  mockValidateRequest
};
