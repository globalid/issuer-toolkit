import { DEFAULT_BASE_SSI_URL, GidCredentialOffer } from '../common';
import * as epam from '../services/epam';
import AccessTokenProvider from '../utils/access-token-provider';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';

export class EpamClient {
  #accessTokenProvider: AccessTokenProvider;

  constructor(accessTokenProvider: AccessTokenProvider, baseSsiUrl = DEFAULT_BASE_SSI_URL) {
    // TODO: validate parameters
    this.#accessTokenProvider = accessTokenProvider;
    epam.init(baseSsiUrl);
  }

  async sendOffer(offer: GidCredentialOffer): Promise<void> {
    // TODO: validate parameter
    const accessToken: string = await this.#accessTokenProvider.getAccessToken();
    await epam.createCredentialOfferV2(accessToken, createEpamCredentialOffer(offer));
  }

  async reportError(threadId: string, errorCode: ErrorCode): Promise<void> {
    // TODO: validate parameters
    const accessToken: string = await this.#accessTokenProvider.getAccessToken();
    await epam.createErrorReport(accessToken, {
      code: errorCode,
      description: ERROR_DESCRIPTIONS[errorCode],
      thread_id: threadId
    });
  }
}

export type ErrorCode = keyof typeof ERROR_DESCRIPTIONS;

export const ERROR_DESCRIPTIONS = {
  '600-1': 'Credential request failed because some information could not be verified',
  '600-7': 'GlobaliD erred or is not available at the moment',
  '600-8': 'Issuer erred or is not available at the moment',
  '600-16': 'Validation of credential request failed'
};

export enum ErrorCodes {
  CredentialRequestFailed = '600-1',
  GidUnavailable = '600-7',
  IssuerUnavailable = '600-8',
  RequestValidationFailed = '600-16'
}

export default EpamClient;
