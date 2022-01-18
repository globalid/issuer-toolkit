# Issuer Toolkit

This is a library for credential issuers integrated with GlobaliD.

- [Installation](#installation)
- [Usage](#usage)
  - [Validating a Credential Request](#validating-a-credential-request)
  - [Uploading a File](#uploading-a-file)
  - [Sending a Credential Offer](#sending-a-credential-offer)
  - [Reporting an Error](#reporting-an-error)
    - [Error Codes](#error-codes)
  - [Downloading a File](#downloading-a-file)
  - [Testing Utilities](#testing-utilities)
    - [Nock](#nock)
    - [Sinon](#sinon)
- [TypeScript](#typescript)
- [Development](#development)

## Installation

```sh
npm install @globalid/issuer-toolkit
```

## Usage

The `GidClient` class is the primary component of the toolkit, providing several methods for issuing a credential.

The constructor requires the client ID and secret of a developer app created in [GlobaliD's developer portal](https://developer.global.id/).

```js
const clientId = '...';
const clientSecret = '...';
const client = new GidClient(clientId, clientSecret);
```

The `GidClient` supports the typical flow for issuing a credential:

1. Receive and [validate a credential request](#validating-a-credential-request).
1. [Encrypt and upload file claims](#uploading-a-file) (optional).
1. Build and [send a credential offer](#sending-a-credential-offer).

If anything goes wrong in that process, issuers can [report an error](#reporting-an-error), which notifies the prospective holder of a problem in the credential issuance.

### Validating a Credential Request

The `validateRequest` method will check the validity of a `CredentialRequest`, which consists of the following properties:

- `data` (optional) - Information about the credential being requested
- `gidUuid` - UUID of the holder's GlobaliD identity
- `signature` - Result of [digitally signing](https://en.wikipedia.org/wiki/Digital_signature) the concatenation of the `threadId`, `timestamp`, and (if present) `data`, using the holder's private key
- `threadId` - ID correlating interactions related to this credential request
- `timestamp` - Time of the request as the number of milliseconds since the Unix epoch

Of those, the `signature` and `timestamp` are validated. The `signature` is [verified](https://nodejs.org/api/crypto.html#cryptoverifyalgorithm-data-key-signature-callback) using the public key corresponding to the holder's identity (identified by `gidUuid`). The `timestamp` must be no more than 5 minutes in the past or 1 minute in the future. If the credential request is invalid, an error is thrown.

This method also handles boilerplate [error reporting](#reporting-an-error). An `InvalidSignatureError`, `StaleRequestError`, or `EagerRequestError` is reported as a `600-16`. All other errors are reported as a `600-7`.

```js
const threadId = '...';
const gidUuid = '...';
const credentialRequest = {
  threadId,
  gidUuid,
  timestamp: 1640995200000,
  signature: 'abcdefghijklmnopqrstuvwxyz',
  data: {
    givenName: 'Neville',
    birthDate: '1980-07-30'
  }
};

try {
  await client.validateRequest(credentialRequest);
} catch (error) {
  if (error instanceof IdentityNotFoundError) {
    // invalid identity (i.e., `gidUuid` does not exist)
  } else if (error instanceof PublicKeyNotFoundError) {
    // user has no public key
  } else if (error instanceof InvalidSignatureError) {
    // `signature` is invalid
  } else if (error instanceof StaleRequestError || error instanceof EagerRequestError) {
    // `timestamp` is outside acceptable range
  }
}
```

### Uploading a File

The `uploadFile` method allows for encrypting and uploading a file to GlobaliD's S3 instance. The file is encrypted using AES and a randomly-generated 256-bit key, which is itself encrypted using the holder's public key.

```js
const fileClaim = await client.uploadFile(gidUuid, {
  name: '8bfd3afe-8f0b-4583-836e-97cde534e304.foo.jpg',
  type: 'image/jpeg',
  content: Buffer.from(/* ... */)
});
```

The result of `uploadFile` is a `FileClaimValue` intended for use in a `CredentialOffer` (see [Sending a Credential Offer](#sending-a-credential-offer)). A `FileClaimValue` has the following properties:

- `decryptionKey` - Symmetric key used to decrypt (via AES) the payload received by dereferencing the `url`. The key is encrypted using RSA and the holder's public key.
- `sha512sum` - Checksum of the file's content
- `type` - Media type of the file's content
- `url` - Location of the encrypted file

### Sending a Credential Offer

The `sendOffer` method allows sending an offer for a credential following a credential request. The method accepts a `CredentialOffer`, which has the following properties:

- `claims` - Claims about the credential subject
- `contextUri` - URI of a JSON-LD context describing the credential subject
- `description` (optional) - Descriptive text about the credential being offered
- `name` - Name of the credential being offered
- `schemaUri` - URI of a JSON Schema describing the data schema of the credential subject's claims
- `subjectType` - JSON-LD `@type` of the credential subject
- `threadId` - ID correlating interactions related to this credential request

```js
const claims = ;

const credentialOffer = {
  threadId,
  name: 'Government ID',
  description: 'Lorem ipsum dolor sit amet',
  contextUri: 'https://example.com/contexts/Person',
  schemaUri: 'https://example.com/schemas/Person',
  subjectType: 'Person',
  claims: {
    givenName: 'Neville',
    birthDate: '1980-07-30',
    avatar: fileClaim
  }
};

await client.sendOffer(credentialOffer);
```

### Reporting an Error

If something goes wrong while fulfilling a credential request, you can report the error using the `reportError` method.

```js
await client.reportError(threadId, '600-1');
```

#### Error Codes

| Code     | Description                                                   |
| -------- | ------------------------------------------------------------- |
| `300-8`  | Document unsupported                                          |
| `600-1`  | General credential request failure                            |
| `600-3`  | Verification process was cancelled                            |
| `600-7`  | GlobaliD erred or is unavailable                              |
| `600-8`  | Issuer is unavailable                                         |
| `600-16` | [Request validation](#validating-a-credential-request) failed |

### Downloading a File

The toolkit offers the `downloadFile` utility function for downloading and optionally decrypting a file from a URL, presumably sent in the initial credential request. This function is essentially the inverse of `GidClient`'s `uploadFile`.

In addition to a URL string, `downloadFile` accepts the following options:

- `decryptionKey` - Symmetric key used to decrypt the downloaded file via AES. The file is assumed to be in plaintext if this option is absent.
- `privateKey` - Asymmetric private key (typically the issuer's) used to decrypt the `decryptionKey` via RSA. The `decryptionKey` is assumed to be plaintext if this option is absent.
- `sha512sum` - Checksum used to validate the integrity of the downloaded (and possibly decrypted) file

```js
import { downloadFile } from '@globalid/issuer-toolkit';

const buffer1 = await downloadFile('http://example.com/unencrypted-file');
const buffer2 = await downloadFile('https://example.com/encrypted-file', {
  decryptionKey: request.data.avatar.key,
  privateKey: process.env.PRIVATE_KEY,
  sha512sum: request.data.avatar.checksum
});
```

### Testing Utilities

#### Nock

The `@globalid/issuer-toolkit/testing` module provides functions for mocking the HTTP requests (using [`nock`](https://npmjs.com/package/nock)) made by `GidClient`. There are `mock*` functions for each `GidClient` method, as well as a `clearMocks` function for cleanup.

```js
import * as GidClient from '@globalid/issuer-toolkit/testing';

afterEach(() => {
  GidClient.clearMocks();
});

test('request validation', async () => {
  GidClient.mockValidateRequest(gidUuid, publicKey);

  // call your code that uses GidClient#validateRequest...

  // assertions...
});

test('sending an offer', async () => {
  GidClient.mockSendOffer();
  // ...
});
```

#### Sinon

The `@globalid/issuer-toolkit/testing/sinon` allows [Sinon](https://sinonjs.org/) users to create a `GidClient` stub.

```js
import stubGidClient from '@globalid/issuer-toolkit/testing/sinon';
import sinon from 'sinon';

const GidClientStub = stubGidClient();

afterEach(() => {
  sinon.restore();
});

test('request validation', async () => {
  GidClientStub.validateRequest.withArgs(/* ... */).resolves();

  // call your code that uses GidClient#validateRequest...

  // assertions...
});

test('sending an offer', async () => {
  GidClientStub.sendOffer.withArgs(/* ... */).resolves();
  // ...
});
```

## TypeScript

The issuer toolkit is written in TypeScript, so type declarations are bundled with the package.

## Development

The following NPM scripts are available for development:

- `build` – Runs the `clean`, `genver`, `compile`, `lint`, and `format:check` scripts to build the project
- `clean` – Removes the output directory for a clean build
- `compile` – Compiles TypeScript files with `tsc`
- `format` – Formats the files with [Prettier](https://prettier.io/)
- `format:check` – Checks the formatting of the files with Prettier
- `genver` - Generates a version module with [`genversion`](https://www.npmjs.com/package/genversion)
- `lint` – Lints the code with [ESLint](https://eslint.org/)
- `lint:fix` – Attempts to fix problems found by the linter
- `test` – Tests the code with [Jest](https://jestjs.io/)
- `test:watch` – Tests the code in watch mode
