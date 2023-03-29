import '../../test/setup';

import download from '../services/download';
import { encrypt, sha512sum } from './crypto';
import { DataIntegrityError, downloadFile } from './download-file';
import { ED25519 } from 'globalid-crypto-library';

jest.mock('../services/download');

const mockedDownload = jest.mocked(download);

const url = 'http://example.com/file';
const file = Buffer.from('Lorem ipsum dolor sit amet');

test('should download unencrypted file', async () => {
  mockedDownload.mockResolvedValueOnce(file);

  const result = await downloadFile(url);

  expect(result).toEqual(file);
});

test('should download and decrypt encrypted file', async () => {
  const alice = ED25519.generateKeys()
  const bob = ED25519.generateKeys()
  const encryptedFile = encrypt(file, bob.privateKey, alice.publicEncryptionKey)

  mockedDownload.mockResolvedValueOnce(encryptedFile);

  const result = await downloadFile(url, { privateKey: alice.privateKey, publicEncryptionKey: bob.publicEncryptionKey });

  expect(result).toEqual(file);
});

test('should not throw on valid checksum', async () => {
  const alice = ED25519.generateKeys()
  const bob = ED25519.generateKeys()
  const checksum = sha512sum(file)
  const encryptedFile = encrypt(file, bob.privateKey, alice.publicEncryptionKey)

  mockedDownload.mockResolvedValueOnce(encryptedFile);

  const result = await downloadFile(url, { privateKey: alice.privateKey, publicEncryptionKey: bob.publicEncryptionKey, sha512sum: checksum });

  expect(result).toEqual(file);
});

test('should throw DataIntegrityError on checksum mismatch', async () => {
  const alice = ED25519.generateKeys()
  const bob = ED25519.generateKeys()
  const encryptedFile = encrypt(file, bob.privateKey, alice.publicEncryptionKey)

  mockedDownload.mockResolvedValueOnce(encryptedFile);

  const result = downloadFile(url, { privateKey: alice.privateKey, publicEncryptionKey: bob.publicEncryptionKey, sha512sum: sha512sum(encryptedFile) });

  await expect(result).rejects.toThrow(DataIntegrityError);
});

