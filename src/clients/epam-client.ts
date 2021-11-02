import { GidCredentialOffer } from '../common';
import * as errors from '../error';
import * as epam from '../services/epam';
import AccessTokenProvider from '../utils/access-token-provider';
import createEpamCredentialOffer from '../utils/epam-credential-offer-factory';

export class EpamClient {
  constructor(readonly accessTokenProvider: AccessTokenProvider, gidSsiHost: string = 'ssi.global.id') {
    // TODO: validate parameters
    epam.init(`https://${gidSsiHost}`);
  }

  async sendOffer(offer: GidCredentialOffer): Promise<void> {
    // TODO: validate parameter
    const accessToken: string = await this.accessTokenProvider.getAccessToken();
    await epam.createCredentialOfferV2(accessToken, createEpamCredentialOffer(offer));
  }

  async reportError(threadId: string, errorCode: errors.ErrorCode): Promise<void> {
    // TODO: validate parameters
    const accessToken: string = await this.accessTokenProvider.getAccessToken();
    await epam.createErrorReport(accessToken, {
      code: errorCode,
      description: errors.ERROR_DESCRIPTIONS[errorCode],
      thread_id: threadId
    });
  }
}

export { ErrorCode, ErrorCodes } from '../error';
export * from '../common';
