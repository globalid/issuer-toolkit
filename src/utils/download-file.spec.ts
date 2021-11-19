import '../../test/setup';

import { mocked } from 'ts-jest/utils';

import download from '../services/download';
import { decrypt } from './crypto';
import { DataIntegrityError, downloadFile } from './download-file';

jest.mock('../services/download');
jest.mock('./crypto');

const mockedDecrypt = mocked(decrypt);
const mockedDownload = mocked(download);

const url = 'http://example.com/file';
const file = Buffer.from('Lorem ipsum dolor sit amet');
const encryptedFile = Buffer.from('abcdefghijklmnopqrstuvwxyz');

test('should download unencrypted file', async () => {
  mockedDownload.mockResolvedValueOnce(file);

  const result = await downloadFile(url);

  expect(result).toBe(file);
  expect(mockedDownload).toHaveBeenCalledTimes(1);
  expect(mockedDownload).toHaveBeenCalledWith(url);
  expect(mockedDecrypt).not.toHaveBeenCalled();
});

test('should download and decrypt encrypted file', async () => {
  const decryptionKey = 'foobar';
  mockedDownload.mockResolvedValueOnce(encryptedFile);
  mockedDecrypt.mockReturnValueOnce(file);

  const result = await downloadFile(url, { decryptionKey });

  expect(result).toBe(file);
  expect(mockedDownload).toHaveBeenCalledTimes(1);
  expect(mockedDownload).toHaveBeenCalledWith(url);
  expect(mockedDecrypt).toHaveBeenCalledTimes(1);
  expect(mockedDecrypt).toHaveBeenCalledWith(encryptedFile, decryptionKey, undefined);
});

test('should throw DataIntegrityError on checksum mismatch', async () => {
  mockedDownload.mockResolvedValueOnce(file);

  await expect(downloadFile(url, { sha512sum: 'foo' })).rejects.toThrow(DataIntegrityError);
  expect(mockedDownload).toHaveBeenCalledTimes(1);
  expect(mockedDownload).toHaveBeenCalledWith(url);
  expect(mockedDecrypt).not.toHaveBeenCalled();
});
