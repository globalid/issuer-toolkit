import dayjs from 'dayjs';

import { CredentialRequest } from '../common';

/**
 * Validates the `timestamp` of the given credential request and throws an error if it's outside the required bounds.
 * @param request Credential request to be validated
 * @throws {@link StaleRequestError} if `timestamp` is more the 5 minutes in the past
 * @throws {@link EagerRequestError} if `timestamp` is more than 1 minute in the future
 */
export function validateTimestamp(request: CredentialRequest): void {
  const now = dayjs();
  const timestamp = dayjs(request.timestamp);
  const stalenessThreshold = makeStalenessThreshold(now);
  if (timestamp.isBefore(stalenessThreshold)) {
    throw new StaleRequestError(timestamp.format(), stalenessThreshold.format());
  }
  const eagernessThreshold = makeEagernessThreshold(now);
  if (timestamp.isAfter(eagernessThreshold)) {
    throw new EagerRequestError(timestamp.format(), eagernessThreshold.format());
  }
}

const makeStalenessThreshold = (start: dayjs.Dayjs) => start.subtract(5, 'minutes');

const makeEagernessThreshold = (start: dayjs.Dayjs) => start.add(1, 'minute');

export class EagerRequestError extends Error {
  constructor(timestamp: string, eagernessThreshold: string) {
    super(`Credential request timestamp (${timestamp}) is after eagerness threshold (${eagernessThreshold}).`);
  }
}

export class StaleRequestError extends Error {
  constructor(timestamp: string, stalenessThreshold: string) {
    super(`Credential request timestamp (${timestamp}) is before staleness threshold (${stalenessThreshold}).`);
  }
}

export default validateTimestamp;
