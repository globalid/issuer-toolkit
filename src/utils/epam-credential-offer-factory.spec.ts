import { threadId } from '../../test/stubs';
import { CredentialOffer, FileType } from '../common';
import createEpamCredentialOffer from './epam-credential-offer-factory';

const name = 'Foo Bar';
const description = 'Lorem ipsum dolor sit amet';
const expirationDate = new Date().toISOString();
const subjectType = 'Foo';
const contextUri = 'https://example.com/context';
const schemaUri = 'https://example.com/schema';

test('should transform GidCredentialOffer into EPAM credential offer', () => {
  const offer: CredentialOffer = {
    threadId,
    name,
    description,
    expirationDate,
    subjectType,
    contextUri,
    schemaUri,
    claims: {
      boolean: false,
      number: 42,
      string: 'foobar',
      undefined: undefined,
      file: {
        type: FileType.JPEG,
        name: 'uuid.some-file.jpg',
        sha512sum: 'abcdefg',
        url: 'https://example.com/some-file'
      }
    }
  };

  const result = createEpamCredentialOffer(offer);

  expect(result).toEqual({
    thread_id: threadId,
    name: name,
    description,
    expiration_date: expirationDate,
    subject_type: subjectType,
    context_uri: contextUri,
    schema_uri: schemaUri,
    attributes: {
      boolean: false,
      number: 42,
      string: 'foobar',
      file: {
        media_type: FileType.JPEG,
        file_name: 'uuid.some-file.jpg',
        decryption_key: '/',
        sha_512_sum: 'abcdefg',
        url: 'https://example.com/some-file'
      }
    }
  });
});
