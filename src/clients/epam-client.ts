import { GidCredentialOffer } from '../common';
import * as epam from '../services/epam';
import AccessTokenProvider from '../utils/access-token-provider';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';

export class EpamClient {
  constructor(readonly accessTokenProvider: AccessTokenProvider, gidSsiHost = 'ssi.global.id') {
    // TODO: validate parameters
    epam.init(`https://${gidSsiHost}`);
  }

  async sendOffer(offer: GidCredentialOffer): Promise<void> {
    // TODO: validate parameter
    const accessToken: string = await this.accessTokenProvider.getAccessToken();
    await epam.createCredentialOfferV2(accessToken, createEpamCredentialOffer(offer));
  }

  async reportError(threadId: string, errorCode: ErrorCode): Promise<void> {
    // TODO: validate parameters
    const accessToken: string = await this.accessTokenProvider.getAccessToken();
    await epam.createErrorReport(accessToken, {
      code: errorCode,
      description: ERROR_DESCRIPTIONS[errorCode],
      thread_id: threadId
    });
  }
}

export type ErrorCode = keyof typeof ERROR_DESCRIPTIONS;

export const ERROR_DESCRIPTIONS = {
  '600-7': 'globaliD system had an error or is not available at the moment',
  '600-16': 'Validation of credential request failed'
};

export enum ErrorCodes {
  GLOBALID_UNAVAILABLE = '600-7',
  REQUEST_VALIDATION_FAILED = '600-16'
}

export default EpamClient;
