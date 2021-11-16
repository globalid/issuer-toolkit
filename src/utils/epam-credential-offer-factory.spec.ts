import { threadId } from '../../test/stubs';
import { ClaimValueType, FileType, CredentialOffer } from '../common';
import { ValueType } from '../services/epam';
import createEpamCredentialOffer from './epam-credential-offer-factory';

const name = 'Foo Bar';
const description = 'Lorem ipsum dolor sit amet';
const contextIri = 'https://example.com/context';
const subjectType = 'Foo';

test('should transform GidCredentialOffer into EPAM credential offer', () => {
  const offer: CredentialOffer = {
    threadId,
    name,
    description,
    contextIri,
    subjectType,
    claims: {
      boolean: {
        type: ClaimValueType.Boolean,
        value: false
      },
      integer: {
        type: ClaimValueType.Integer,
        value: 42
      },
      number: {
        type: ClaimValueType.Number,
        value: 42.0
      },
      string: {
        type: ClaimValueType.String,
        value: 'foobar'
      },
      date: {
        type: ClaimValueType.Date,
        value: '1970-01-01'
      },
      time: {
        type: ClaimValueType.Time,
        value: '00:00:00Z'
      },
      dateTime: {
        type: ClaimValueType.DateTime,
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

test('should string file claims', () => {
  const offer: CredentialOffer = {
    threadId,
    name,
    description,
    contextIri,
    subjectType,
    claims: {
      jpegFile: {
        type: FileType.JPEG,
        decryptionKey: 'foobar',
        sha512sum: 'abcdefg',
        url: 'https://example.com/some-file'
      },
      pngFile: {
        type: FileType.PNG,
        decryptionKey: 'bazqux',
        sha512sum: 'hijklmn',
        url: 'https://example.com/another-file'
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
        name: 'jpegFile',
        value_type: ValueType.image_jpeg,
        value: JSON.stringify({
          decryption_key: 'foobar',
          media_type: 'image/jpeg',
          sha_512_sum: 'abcdefg',
          url: 'https://example.com/some-file'
        })
      },
      {
        name: 'pngFile',
        value_type: ValueType.image_png,
        value: JSON.stringify({
          decryption_key: 'bazqux',
          media_type: 'image/png',
          sha_512_sum: 'hijklmn',
          url: 'https://example.com/another-file'
        })
      }
    ]
  });
});

test('should infer primitive value types', () => {
  const offer: CredentialOffer = {
    threadId,
    name,
    description,
    contextIri,
    subjectType,
    claims: {
      boolean: false,
      number: 42,
      string: 'foobar'
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
        name: 'number',
        value: '42',
        value_type: ValueType.number
      },
      {
        name: 'string',
        value: 'foobar',
        value_type: ValueType.string
      }
    ]
  });
});
