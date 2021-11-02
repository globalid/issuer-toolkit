export const ERROR_DESCRIPTIONS = {
  '600-7': 'globaliD system had an error or is not available at the moment',
  '600-16': 'Validation of credential request failed'
};

export type ErrorCode = keyof typeof ERROR_DESCRIPTIONS;

export enum ErrorCodes {
  GLOBALID_UNAVAILABLE = '600-7',
  REQUEST_VALIDATION_FAILED = '600-16'
}
