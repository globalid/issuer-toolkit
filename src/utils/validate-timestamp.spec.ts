import dayjs from 'dayjs';

import { gidCredentialRequest, stubGidCredentialRequest } from '../../test/stubs';
import { validateTimestamp, StaleRequestError, EagerRequestError } from './validate-timestamp';

const now = dayjs();

test('should not throw if timestamp is valid', () => {
  expect(() => validateTimestamp(gidCredentialRequest)).not.toThrow();
});

test('should throw StaleRequestError if timestamp is before staleness threshold', () => {
  const request = stubGidCredentialRequest(now.subtract(6, 'minutes').valueOf());

  expect(() => validateTimestamp(request)).toThrow(StaleRequestError);
});

test('should throw EagerRequestError if timestamp is after eagerness threshold', () => {
  const request = stubGidCredentialRequest(now.add(2, 'minutes').valueOf());

  expect(() => validateTimestamp(request)).toThrow(EagerRequestError);
});
