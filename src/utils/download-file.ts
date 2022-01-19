import Joi from 'joi';
import download from '../services/download';
import { decrypt, sha512sum } from './crypto';

/**
 * Downloads and optionally processes a file at the given URL.
 * @param url URL of the file to download
 * @param options {@linkcode DownloadOptions} for additional file processing
 * @returns Downloaded and processed file as a `Buffer`
 * @throws {@linkcode DataIntegrityError} if the checksum of the downloaded file doesn't match the provided `sha512sum`
 */
export async function downloadFile(url: string, options?: DownloadOptions): Promise<Buffer> {
  validateUrl(url);
  validateDownloadOptions(options);
  let data = await download(url);
  if (options?.decryptionKey != null) {
    data = decrypt(data, options.decryptionKey, options.privateKey);
  }
  if (options?.sha512sum != null && options.sha512sum !== sha512sum(data)) {
    throw new DataIntegrityError();
  }
  return data;
}

export interface DownloadOptions {
  /**
   * Symmetric key used to decrypt the downloaded file via AES. The file is assumed to be in plaintext if this option is
   * absent.
   */
  decryptionKey?: string;
  /**
   * Asymmetric private key (typically the issuer's) used to decrypt the `decryptionKey` via RSA. The `decryptionKey` is
   * assumed to be plaintext if this option is absent.
   */
  privateKey?: string;
  /**
   * Checksum used to validate the integrity of the downloaded (and possibly decrypted) file
   */
  sha512sum?: string;
}

const urlSchema = Joi.string().uri().required();

function validateUrl(value: unknown): void {
  const { error } = urlSchema.validate(value);
  if (error != null) {
    throw new TypeError(error.message);
  }
}

const downloadOptionsSchema = Joi.object({
  decryptionKey: Joi.string(),
  privateKey: Joi.string(),
  sha512sum: Joi.string()
}).unknown();

function validateDownloadOptions(value: unknown): void {
  const { error } = downloadOptionsSchema.validate(value);
  if (error != null) {
    throw new TypeError(error.message);
  }
}

export class DataIntegrityError extends Error {}

export default downloadFile;
