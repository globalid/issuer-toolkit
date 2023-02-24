import '../../test/setup';

import download from '../services/download';
import { decrypt } from './crypto';
import { DataIntegrityError, downloadFile, DownloadOptions } from './download-file';
import * as validation from './validation';

jest.mock('../services/download');
jest.mock('./crypto');
jest.mock('./validation');

const mockedDecrypt = jest.mocked(decrypt);
const mockedDownload = jest.mocked(download);
const mockedValidation = jest.mocked(validation);

const url = 'http://example.com/file';
const file = Buffer.from('Lorem ipsum dolor sit amet');
const encryptedFile = Buffer.from('abcdefghijklmnopqrstuvwxyz');

test('should download unencrypted file', async () => {
  mockedDownload.mockResolvedValueOnce(file);

  const result = await downloadFile(url);

  expect(result).toBe(file);
  expect(mockedValidation.validate).toHaveBeenCalledTimes(2);
  expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, url, validation.schemas.url);
  expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, undefined, validation.schemas.downloadOptions);
  expect(mockedDownload).toHaveBeenCalledTimes(1);
  expect(mockedDownload).toHaveBeenCalledWith(url);
  expect(mockedDecrypt).not.toHaveBeenCalled();
});

test('should download and decrypt encrypted file', async () => {
  const decryptionKey = 'foobar';
  const options: DownloadOptions = { decryptionKey };
  mockedDownload.mockResolvedValueOnce(encryptedFile);
  mockedDecrypt.mockReturnValueOnce(file);

  const result = await downloadFile(url, options);

  expect(result).toBe(file);
  expect(mockedValidation.validate).toHaveBeenCalledTimes(2);
  expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, url, validation.schemas.url);
  expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, options, validation.schemas.downloadOptions);
  expect(mockedDownload).toHaveBeenCalledTimes(1);
  expect(mockedDownload).toHaveBeenCalledWith(url);
  expect(mockedDecrypt).toHaveBeenCalledTimes(1);
  expect(mockedDecrypt).toHaveBeenCalledWith(encryptedFile, decryptionKey, undefined);
});

test('should throw DataIntegrityError on checksum mismatch', async () => {
  const options: DownloadOptions = { sha512sum: 'foo' };
  mockedDownload.mockResolvedValueOnce(file);

  await expect(downloadFile(url, options)).rejects.toThrow(DataIntegrityError);
  expect(mockedValidation.validate).toHaveBeenCalledTimes(2);
  expect(mockedValidation.validate).toHaveBeenNthCalledWith(1, url, validation.schemas.url);
  expect(mockedValidation.validate).toHaveBeenNthCalledWith(2, options, validation.schemas.downloadOptions);
  expect(mockedDownload).toHaveBeenCalledTimes(1);
  expect(mockedDownload).toHaveBeenCalledWith(url);
  expect(mockedDecrypt).not.toHaveBeenCalled();
});
