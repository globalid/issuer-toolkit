import { isInStringEnum, isRecord, isString } from './utils/type-guards';

export interface CredentialOffer<T extends Claims = Claims> {
  /**
   * Claims about the credential subject
   */
  claims: T;
  /**
   * URI of a JSON-LD context describing the credential subject
   */
  contextUri?: string;
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
  schemaUri?: string;
  /**
   * JSON-LD `@type` of the credential subject
   */
  subjectType: string;
  /**
   * ID correlating interactions related to this credential request
   */
  threadId: string;
}

export type Claims = Record<string, ClaimValue | undefined>;
export type ClaimValue = boolean | number | string | FileClaimValue;

export interface FileClaimValue {
  /**
   * Symmetric key used to decrypt (via AES) the payload received by dereferencing the `url`. The key is encrypted using
   * RSA and the holder's public key.
   */
  decryptionKey: string;
  /**
   * Name of the original file. Should have the form `{UUID}[-_.]{human_readable_name}.{extension}`.
   */
  name: string;
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
   * Information about the credential being requested
   */
  data?: T;
  /**
   * UUID of the holder's GlobaliD identity
   */
  gidUuid: string;
  /**
   * Result of [digitally signing](https://en.wikipedia.org/wiki/Digital_signature) the concatenation of the `threadId`,
   * `timestamp`, and (if present) `data`, using the holder's private key
   */
  signature: string;
  /**
   * ID correlating interactions related to this credential request
   */
  threadId: string;
  /**
   * Time of the request as the number of milliseconds since the Unix epoch
   */
  timestamp: number;
}

export const DEFAULT_BASE_API_URL = 'https://api.global.id';
export const DEFAULT_BASE_SSI_URL = 'https://credentials.global.id';
