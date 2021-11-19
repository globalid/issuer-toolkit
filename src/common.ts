import { isInStringEnum, isRecord, isString } from './utils/type-guards';

export interface CredentialOffer {
  /**
   * Claims about the credential subject
   */
  claims: Claims;
  /**
   * URI of a JSON-LD context describing the credential subject
   */
  contextUri: string;
  /**
   * Descriptive text about the credential being offered
   */
  description?: string;
  /**
   * Name of the credential being offered
   */
  name: string;
  /**
   * URI of a JSON Schema describing the data schema of the credential subject's claims
   */
  schemaUri: string;
  /**
   * JSON-LD `@type` of the credential subject
   */
  subjectType: string;
  /**
   * Thread ID received from the holder
   */
  threadId: string;
}

export type Claims = Record<string, ClaimValue>;
export type ClaimValue = boolean | number | string | FileClaimValue;

export interface FileClaimValue {
  /**
   * Symmetric key used to decrypt (via AES) the payload received by dereferencing the `url`. The key is encrypted using
   * RSA and the holder's public key.
   */
  decryptionKey: string;
  /**
   * Checksum of the file's content
   */
  sha512sum: string;
  /**
   * Media type of the file's content
   */
  type: FileType;
  /**
   * Location of the encrypted file
   */
  url: string;
}

export enum FileType {
  JPEG = 'image/jpeg',
  PNG = 'image/png'
}

export function isFileClaimValue(value: unknown): value is FileClaimValue {
  return (
    isRecord(value) &&
    isString(value.decryptionKey) &&
    isString(value.sha512sum) &&
    isInStringEnum(value.type, FileType) &&
    isString(value.url)
  );
}

export interface CredentialRequest<T = unknown> {
  /**
   * Thread ID received from the holder
   */
  threadId: string;
  /**
   * UUID of the holder's GlobaliD identity
   */
  gidUuid: string;
  /**
   * Time of the request as the number of milliseconds since the Unix epoch
   */
  timestamp: number;
  /**
   * Data about the credential being requested
   */
  payload?: T;
  /**
   * Holder's signature of the `threadId`, `timestamp`, and `payload`
   */
  signature: string;
}

export const DEFAULT_BASE_API_URL = 'https://api.global.id';
export const DEFAULT_BASE_SSI_URL = 'https://ssi.global.id';
