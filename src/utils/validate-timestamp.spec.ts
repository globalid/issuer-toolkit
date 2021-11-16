import dayjs from 'dayjs';

import { credentialRequest, stubCredentialRequest } from '../../test/stubs';
import { validateTimestamp, StaleRequestError, EagerRequestError } from './validate-timestamp';

const now = dayjs();

test('should not throw if timestamp is valid', () => {
  expect(() => validateTimestamp(credentialRequest)).not.toThrow();
});

test('should throw StaleRequestError if timestamp is before staleness threshold', () => {
  const request = stubCredentialRequest(now.subtract(6, 'minutes').valueOf());

  expect(() => validateTimestamp(request)).toThrow(StaleRequestError);
});

test('should throw EagerRequestError if timestamp is after eagerness threshold', () => {
  const request = stubCredentialRequest(now.add(2, 'minutes').valueOf());

  expect(() => validateTimestamp(request)).toThrow(EagerRequestError);
});
