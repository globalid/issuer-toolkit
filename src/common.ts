export interface GidCredentialOffer {
  /**
   * Thread ID received from the holder
   */
  threadId: string;
  /**
   * Name of the credential being offered
   */
  name: string;
  /**
   * Descriptive text about the credential being offered
   */
  description?: string;
  /**
   * IRI of a JSON-LD context describing the credential subject
   */
  contextIri: string;
  /**
   * JSON-LD `@type` of the credential subject
   */
  subjectType: string;
  /**
   * Claims about the credential subject
   */
  claims: Claims;
}

export type Claims = Record<string, ClaimValue>;
export type ClaimValue = /* boolean | number | string | */ ClaimValueObject;
export type ClaimValueObject = PrimitiveClaimValueObject /* | FileClaimValueObject */;

export interface PrimitiveClaimValueObject {
  type: PrimitiveClaimValueType;
  value: boolean | number | string;
}

export enum PrimitiveClaimValueType {
  Boolean = 'boolean',
  Integer = 'integer',
  Number = 'number',
  String = 'string',
  Date = 'date',
  Time = 'time',
  DateTime = 'date-time'
}

export interface FileClaimValueObject {
  decryptionKey: string;
  sha512sum: string;
  type: FileClaimValueType;
  url: string;
}

export enum FileClaimValueType {
  JPEG = 'image/jpeg'
}

export interface GidCredentialRequest<T = unknown> {
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
