import AccessTokenProvider from './access-token-provider';
import { EpamClient } from './epam-client';
import FileUploader from './file-uploader';
import { GidIssuerClient } from './gid-issuer-client';
import { PublicKeyProvider } from './public-key-provider';
import { schemas, validate } from '../utils/validation';

export function createGidIssuerClient(
  clientId: string,
  clientSecret: string,
  options?: GidIssuerClientOptions
): GidIssuerClient {
  validate(clientId, schemas.requiredString);
  validate(clientSecret, schemas.requiredString);
  validate(options, schemas.gidIssuerClientOptions);
  const accessTokenProvider = new AccessTokenProvider(clientId, clientSecret, options?.baseApiUrl);
  const epamClient = new EpamClient(accessTokenProvider, options?.baseSsiUrl);
  const fileUploader = new FileUploader(accessTokenProvider, options?.baseApiUrl);
  const publicKeyProvider = new PublicKeyProvider(options?.baseApiUrl);

  return new GidIssuerClient(accessTokenProvider, epamClient, fileUploader, publicKeyProvider);
}

export interface GidIssuerClientOptions {
  baseApiUrl?: string;
  baseSsiUrl?: string;
}
