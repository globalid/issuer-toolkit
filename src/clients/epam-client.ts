import {
  DEFAULT_BASE_SSI_URL,
  CredentialOffer,
  DirectCredentialOfferWithThreadId,
  DirectCredentialOfferWithGidUuid
} from '../common';
import * as epam from '../services/epam';
import AccessTokenProvider from './access-token-provider';
import createEpamCredentialOffer, { createEpamDirectCredentialOffer } from '../utils/epam-credential-offer-factory';
import { ERROR_DESCRIPTIONS } from './issuer-error-codes';

export { EpamDirectOfferResponse } from '../services/epam';

export { ERROR_DESCRIPTIONS };
export type ErrorCode = keyof typeof ERROR_DESCRIPTIONS;

export enum ErrorCodes {
  DocumentUnsupported = '300-8',
  CredentialRequestFailed = '600-1',
  VerificationCancelled = '600-3',
  GidUnavailable = '600-7',
  IssuerUnavailable = '600-8',
  RequestValidationFailed = '600-16'
}

export class EpamClient {
  #accessTokenProvider: AccessTokenProvider;
  #appUuid?: string;

  constructor(accessTokenProvider: AccessTokenProvider, baseSsiUrl = DEFAULT_BASE_SSI_URL) {
    this.#accessTokenProvider = accessTokenProvider;
    epam.init(baseSsiUrl);
  }

  public getAppUuid(): string | undefined {
    return this.#appUuid;
  }

  public setAppUuid(appUuid: string) {
    this.#appUuid = appUuid;
  }

  async sendOffer(offer: CredentialOffer): Promise<void> {
    const accessToken: string = await this.#accessTokenProvider.getAccessToken();
    await epam.createCredentialOfferV2(accessToken, createEpamCredentialOffer(offer), this.getAppUuid());
  }

  async sendDirectOffer(
    offer: DirectCredentialOfferWithGidUuid | DirectCredentialOfferWithThreadId
  ): Promise<epam.EpamDirectOfferResponse> {
    const accessToken: string = await this.#accessTokenProvider.getAccessToken();
    return await epam.createDirectCredentialOffer(
      accessToken,
      createEpamDirectCredentialOffer(offer),
      this.getAppUuid()
    );
  }

  async reportError(threadId: string, errorCode: ErrorCode): Promise<void> {
    const accessToken: string = await this.#accessTokenProvider.getAccessToken();
    await epam.createErrorReport(
      accessToken,
      {
        code: errorCode,
        description: ERROR_DESCRIPTIONS[errorCode],
        thread_id: threadId
      },
      this.getAppUuid()
    );
  }
}

export default EpamClient;
