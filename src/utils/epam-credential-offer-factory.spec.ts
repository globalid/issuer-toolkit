import { threadId } from '../../test/stubs';
import { GidCredentialOffer, PrimitiveClaimValueType } from '../common';
import { ValueType } from '../services/epam';
import createEpamCredentialOffer from './epam-credential-offer-factory';

test('should transform GidCredentialOffer into EPAM credential offer', () => {
  const name = 'Foo Bar';
  const description = 'Lorem ipsum dolor sit amet';
  const contextIri = 'https://example.com/context';
  const subjectType = 'Foo';
  const offer: GidCredentialOffer = {
    threadId,
    name,
    description,
    contextIri,
    subjectType,
    claims: {
      boolean: {
        type: PrimitiveClaimValueType.Boolean,
        value: false
      },
      integer: {
        type: PrimitiveClaimValueType.Integer,
        value: 42
      },
      number: {
        type: PrimitiveClaimValueType.Number,
        value: 42.0
      },
      string: {
        type: PrimitiveClaimValueType.String,
        value: 'foobar'
      },
      date: {
        type: PrimitiveClaimValueType.Date,
        value: '1970-01-01'
      },
      time: {
        type: PrimitiveClaimValueType.Time,
        value: '00:00:00Z'
      },
      dateTime: {
        type: PrimitiveClaimValueType.DateTime,
        value: '1970-01-01T00:00:00Z'
      }
    }
  };

  const result = createEpamCredentialOffer(offer);

  expect(result).toEqual({
    thread_id: threadId,
    name: name,
    description,
    schema_url: contextIri,
    schema_type: subjectType,
    attributes: [
      {
        name: 'boolean',
        value: 'false',
        value_type: ValueType.boolean
      },
      {
        name: 'integer',
        value: '42',
        value_type: ValueType.integer
      },
      {
        name: 'number',
        value: '42',
        value_type: ValueType.number
      },
      {
        name: 'string',
        value: 'foobar',
        value_type: ValueType.string
      },
      {
        name: 'date',
        value: '1970-01-01',
        value_type: ValueType.date
      },
      {
        name: 'time',
        value: '00:00:00Z',
        value_type: ValueType.time
      },
      {
        name: 'dateTime',
        value: '1970-01-01T00:00:00Z',
        value_type: ValueType.date_time
      }
    ]
  });
});
