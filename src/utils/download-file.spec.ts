import '../../test/setup';

import download from '../services/download';
import { encrypt, sha512sum } from './crypto';
import { DataIntegrityError, downloadFile } from './download-file';

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
  const [encryptedFile, decryptionKey] = encrypt(file);

  mockedDownload.mockResolvedValueOnce(encryptedFile);

  const result = await downloadFile(url, {decryptionKey});

  expect(result).toEqual(file);
});

test('should not throw on valid checksum', async () => {
  const checksum = sha512sum(file);
  const [encryptedFile, decryptionKey] = encrypt(file);

  mockedDownload.mockResolvedValueOnce(encryptedFile);

  const result = await downloadFile(url, {
    decryptionKey,
    sha512sum: checksum
  });

  expect(result).toEqual(file);
});

test('should throw DataIntegrityError on checksum mismatch', async () => {
  const [encryptedFile, decryptionKey] = encrypt(file);

  mockedDownload.mockResolvedValueOnce(encryptedFile);

  const result = downloadFile(url, {
    decryptionKey,
    sha512sum: sha512sum(encryptedFile)
  });

  await expect(result).rejects.toThrow(DataIntegrityError);
});
