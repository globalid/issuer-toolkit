import AccessTokenProvider from './access-token-provider';
import { EpamClient } from './epam-client';
import FileUploader from './file-uploader';
import { GidClient } from './gid-client';
import { PublicKeyProvider } from './public-key-provider';
import { schemas, validate } from '../utils/validation';

export function createGidClient(clientId: string, clientSecret: string, options?: GidClientOptions): GidClient {
  validate(clientId, schemas.requiredString);
  validate(clientSecret, schemas.requiredString);
  validate(options, schemas.gidClientOptions);
  const accessTokenProvider = new AccessTokenProvider(clientId, clientSecret, options?.baseApiUrl);
  const epamClient = new EpamClient(accessTokenProvider, options?.baseSsiUrl);
  const fileUploader = new FileUploader(accessTokenProvider, options?.baseApiUrl);
  const publicKeyProvider = new PublicKeyProvider(options?.baseApiUrl);

  return new GidClient(accessTokenProvider, epamClient, fileUploader, publicKeyProvider);
}

export interface GidClientOptions {
  baseApiUrl?: string;
  baseSsiUrl?: string;
}
