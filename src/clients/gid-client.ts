import { GidCredentialOffer, GidCredentialRequest } from '../common';
import AccessTokenProvider from '../utils/access-token-provider';
// imports needed for JSDocs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IdentityNotFoundError, PublicKeyNotFoundError, PublicKeyProvider } from '../utils/public-key-provider';
import { EagerRequestError, StaleRequestError, validateTimestamp } from '../utils/validate-timestamp';
import { InvalidSignatureError, verifySignature } from '../utils/verify-signature';
import { EpamClient, ErrorCode, ErrorCodes } from './epam-client';

export class GidClient {
  #accessTokenProvider: AccessTokenProvider;
  #epamClient: EpamClient;
  #publicKeyProvider: PublicKeyProvider;

  constructor(clientId: string, clientSecret: string, options?: GidClientOptions) {
    // TODO: validate parameters
    this.#accessTokenProvider = new AccessTokenProvider(clientId, clientSecret, options?.gidApiHost);
    this.#epamClient = new EpamClient(this.#accessTokenProvider, options?.gidSsiHost);
    this.#publicKeyProvider = new PublicKeyProvider(options?.gidApiHost);
  }

  get clientId(): string {
    return this.#accessTokenProvider.clientId;
  }

  get clientSecret(): string {
    return this.#accessTokenProvider.clientSecret;
  }

  /**
   * Get an access token for calling protected GlobaliD API endpoints
   * @returns OAuth 2.0 access token
   */
  async getAccessToken(): Promise<string> {
    return this.#accessTokenProvider.getAccessToken();
  }

  /**
   * Report an error to GlobaliD corresponding to the given thread ID
   * @param threadId Thread ID received from the holder
   * @param errorCode GlobaliD error code
   */
  async reportError(threadId: string, errorCode: ErrorCode): Promise<void> {
    // TODO: validate parameters
    this.#epamClient.reportError(threadId, errorCode);
  }

  /**
   * Send an offer for a credential
   * @param threadId Thread ID received from the holder
   * @param offer Credential offer to send
   */
  async sendOffer(offer: GidCredentialOffer): Promise<void> {
    // TODO: validate parameter
    this.#epamClient.sendOffer(offer);
  }

  /**
   * Validates the given credential request and throws an error if the request is invalid. This method also handles
   * boilerplate error reporting (via {@link GidClient.reportError}). Namely, errors are reported as follows:
   * * {@link errors.InvalidSignatureError InvalidSignatureError} &rarr; `600-16`
   * * {@link errors.StaleRequestError StaleRequestError} &rarr; `600-16`
   * * {@link errors.EagerRequestError EagerRequestError} &rarr; `600-16`
   * * All other errors &rarr; `600-7`
   * @param request Credential request to validate
   * @throws {@link IdentityNotFoundError} if request's `gidUuid` is invalid
   * @throws {@link PublicKeyNotFoundError} if no public key found corresponding to request's `gidUuid`
   * @throws {@link InvalidSignatureError} if request's `signature` is invalid
   * @throws {@link StaleRequestError} if request's `timestamp` is more the 5 minutes in the past
   * @throws {@link EagerRequestError} if request's `timestamp` is more than 1 minute in the future
   */
  async validateRequest(request: GidCredentialRequest): Promise<void> {
    try {
      const publicKey = await this.#publicKeyProvider.getPublicKey(request.gidUuid);
      verifySignature(request, publicKey);
      validateTimestamp(request);
    } catch (error) {
      if (isSignatureError(error)) {
        await this.reportError(request.threadId, ErrorCodes.REQUEST_VALIDATION_FAILED);
      } else {
        await this.reportError(request.threadId, ErrorCodes.GLOBALID_UNAVAILABLE);
      }
      throw error;
    }
  }
}

const isSignatureError = (error: unknown): error is Error =>
  error instanceof InvalidSignatureError || error instanceof StaleRequestError || error instanceof EagerRequestError;

export interface GidClientOptions {
  gidApiHost?: string;
  gidSsiHost?: string;
}

export { GidCredentialOffer, GidCredentialRequest } from '../common';
export { ErrorCode, ErrorCodes } from './epam-client';
export { IdentityNotFoundError, PublicKeyNotFoundError } from '../utils/public-key-provider';
export { EagerRequestError, StaleRequestError } from '../utils/validate-timestamp';
export { InvalidSignatureError } from '../utils/verify-signature';
export default GidClient;
