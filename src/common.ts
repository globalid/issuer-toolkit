export interface GidCredentialOffer {
  /**
   * Thread ID received from the holder
   */
  threadId: string;
  /**
   * Title of the credential offer displayed to the holder
   */
  title: string;
  /**
   * Descriptive text about the credential offer displayed to the holder
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
  payload: T;
  /**
   * Holder's signature of the `threadId`, `timestamp`, and `payload`
   */
  signature: string;
}
