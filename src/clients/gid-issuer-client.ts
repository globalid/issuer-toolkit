import '../services/interceptors';

import { CredentialOffer, CredentialRequest, FileClaimValue, FileType } from '../common';
import crypto from '../utils/crypto';
import { EagerRequestError, StaleRequestError, validateTimestamp } from '../utils/validate-timestamp';
import { InvalidSignatureError, verifySignature } from '../utils/verify-signature';
import { schemas, validate } from '../utils/validation';
import AccessTokenProvider from './access-token-provider';
import { EpamClient, ErrorCode, ErrorCodes } from './epam-client';
import FileUploader from './file-uploader';
// imports needed for JSDocs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IdentityNotFoundError, PublicKeyNotFoundError, PublicKeyProvider } from './public-key-provider';

export class GidIssuerClient {
  #accessTokenProvider: AccessTokenProvider;
  #epamClient: EpamClient;
  #fileUploader: FileUploader;
  #publicKeyProvider: PublicKeyProvider;

  constructor(
    accessTokenProvider: AccessTokenProvider,
    epamClient: EpamClient,
    fileUploader: FileUploader,
    publicKeyProvider: PublicKeyProvider
  ) {
    this.#accessTokenProvider = accessTokenProvider;
    this.#epamClient = epamClient;
    this.#fileUploader = fileUploader;
    this.#publicKeyProvider = publicKeyProvider;
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
    validate(threadId, schemas.requiredString);
    validate(errorCode, schemas.errorCode);
    await this.#epamClient.reportError(threadId, errorCode);
  }

  /**
   * Send an offer for a credential
   * @param offer Credential offer to send
   */
  async sendOffer(offer: CredentialOffer): Promise<void> {
    validate(offer, schemas.credentialOffer);
    await this.#epamClient.sendOffer(offer);
  }

  /**
   * Encrypts and uploads a file to GlobaliD's S3 instance.
   * @param gidUuid UUID of the holder's GlobaliD identity
   * @param file Content and metadata of the file to encrypt and upload
   * @returns `FileClaimValueObject` to be used in a credential offer
   */
  async uploadFile(gidUuid: string, file: FileObject): Promise<FileClaimValue> {
    validate(gidUuid, schemas.uuid);
    validate(file, schemas.fileObject);

    const [encryptedContent, decryptionKey] = crypto.encrypt(file.content);
    const url = await this.#fileUploader.uploadEncryptedFile(gidUuid, file.name, file.type, encryptedContent);
    return {
      url,
      decryptionKey,
      name: file.name,
      type: file.type,
      sha512sum: crypto.sha512sum(file.content)
    };
  }

  /**
   * Validates the given credential request and throws an error if the request is invalid. This method also handles
   * boilerplate error reporting (via {@linkcode GidIssuerClient.reportError}). Namely, errors are reported as follows:
   * * {@linkcode errors.InvalidSignatureError InvalidSignatureError} &rarr; `600-16`
   * * {@linkcode errors.StaleRequestError StaleRequestError} &rarr; `600-16`
   * * {@linkcode errors.EagerRequestError EagerRequestError} &rarr; `600-16`
   * * All other errors &rarr; `600-7`
   * @param request Credential request to validate
   * @throws {@linkcode IdentityNotFoundError} if request's `gidUuid` is invalid
   * @throws {@linkcode PublicKeyNotFoundError} if no public key found corresponding to request's `gidUuid`
   * @throws {@linkcode InvalidSignatureError} if request's `signature` is invalid
   * @throws {@linkcode StaleRequestError} if request's `timestamp` is more than 5 minutes in the past
   * @throws {@linkcode EagerRequestError} if request's `timestamp` is more than 1 minute in the future
   */
  async validateRequest(request: CredentialRequest): Promise<void> {
    validate(request, schemas.credentialRequest);
    try {
      const publicKey = await this.#publicKeyProvider.getPublicSigningKey(request.gidUuid);
      verifySignature(request, publicKey);
      validateTimestamp(request);
    } catch (error) {
      if (isSignatureError(error)) {
        await this.reportError(request.threadId, ErrorCodes.RequestValidationFailed);
      } else {
        await this.reportError(request.threadId, ErrorCodes.GidUnavailable);
      }
      throw error;
    }
  }
}

const isSignatureError = (error: unknown): error is Error =>
  error instanceof InvalidSignatureError || error instanceof StaleRequestError || error instanceof EagerRequestError;

export interface FileObject {
  /**
   * Unencrypted content of the file
   */
  content: Buffer;
  /**
   * Name of the file
   */
  name: string;
  /**
   * Media type of the file's `content`
   */
  type: FileType;
}

export * from '../common';
export { EagerRequestError, StaleRequestError } from '../utils/validate-timestamp';
export { InvalidSignatureError } from '../utils/verify-signature';
export { ErrorCode, ErrorCodes } from './epam-client';
export { IdentityNotFoundError, PublicKeyNotFoundError } from './public-key-provider';
export default GidIssuerClient;
