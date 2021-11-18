import { threadId } from '../../test/stubs';
import { FileType, CredentialOffer } from '../common';
import createEpamCredentialOffer from './epam-credential-offer-factory';

const name = 'Foo Bar';
const description = 'Lorem ipsum dolor sit amet';
const subjectType = 'Foo';
const contextUri = 'https://example.com/context';
const schemaUri = 'https://example.com/schema';

test('should transform GidCredentialOffer into EPAM credential offer', () => {
  const offer: CredentialOffer = {
    threadId,
    name,
    description,
    subjectType,
    contextUri,
    schemaUri,
    claims: {
      boolean: false,
      number: 42,
      string: 'foobar',
      file: {
        type: FileType.JPEG,
        decryptionKey: 'foobar',
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
    subject_type: subjectType,
    context_uri: contextUri,
    schema_uri: schemaUri,
    attributes: {
      boolean: false,
      number: 42,
      string: 'foobar',
      file: {
        media_type: FileType.JPEG,
        decryption_key: 'foobar',
        sha_512_sum: 'abcdefg',
        url: 'https://example.com/some-file'
      }
    }
  });
});
