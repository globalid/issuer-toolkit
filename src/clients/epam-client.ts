import {
  DEFAULT_BASE_SSI_URL,
  CredentialOffer,
  SEND_OFFER_RETRY_LIMIT,
  SEND_OFFER_BACK_OFF,
  SEND_OFFER_BACK_OFF_FACTOR
} from '../common';
import * as epam from '../services/epam';
import AccessTokenProvider from './access-token-provider';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';
export class EpamClient {
  #accessTokenProvider: AccessTokenProvider;

  constructor(accessTokenProvider: AccessTokenProvider, baseSsiUrl = DEFAULT_BASE_SSI_URL) {
    this.#accessTokenProvider = accessTokenProvider;
    epam.init(baseSsiUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private shouldRetry(e: any, retries: number): boolean {
    const errorCode = e.response?.data?.error_code;
    if (errorCode !== 'ERR_CREDENTIAL_EXCHANGE_RECORD_NOT_FOUND') return false;
    if (retries === SEND_OFFER_RETRY_LIMIT) {
      e.response.data.retries_number = retries;
      return false;
    }
    return true;
  }

  private async sendOfferWithRetry(
    accessToken: string,
    offer: CredentialOffer,
    backOff = SEND_OFFER_BACK_OFF,
    retries = 0
  ) {
    try {
      await epam.createCredentialOfferV2(accessToken, createEpamCredentialOffer(offer));
    } catch (e) {
      if (this.shouldRetry(e, retries)) {
        setTimeout(async () => {
          await this.sendOfferWithRetry(accessToken, offer, backOff * SEND_OFFER_BACK_OFF_FACTOR, retries + 1);
        }, backOff);
      } else {
        throw e;
      }
    }
  }

  async sendOffer(offer: CredentialOffer): Promise<void> {
    const accessToken: string = await this.#accessTokenProvider.getAccessToken();
    await this.sendOfferWithRetry(accessToken, offer);
  }

  async reportError(threadId: string, errorCode: ErrorCode): Promise<void> {
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
  '300-8': 'The document provided is not supported and could not be verified',
  '600-1': 'Credential request failed because some information could not be verified',
  '600-3': 'Verification process was cancelled by the user',
  '600-7': 'GlobaliD erred or is not available at the moment',
  '600-8': 'Issuer erred or is not available at the moment',
  '600-16': 'Validation of credential request failed'
};

export enum ErrorCodes {
  DocumentUnsupported = '300-8',
  CredentialRequestFailed = '600-1',
  VerificationCancelled = '600-3',
  GidUnavailable = '600-7',
  IssuerUnavailable = '600-8',
  RequestValidationFailed = '600-16'
}

export default EpamClient;
