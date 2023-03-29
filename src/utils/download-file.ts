import download from '../services/download';
import { schemas, validate } from './validation';
import { decrypt, sha512sum } from './crypto';

/**
 * Downloads and optionally processes a file at the given URL.
 * @param url URL of the file to download
 * @param options {@linkcode DownloadOptions} for additional file processing
 * @returns Downloaded and processed file as a `Buffer`
 * @throws {@linkcode DataIntegrityError} if the checksum of the downloaded file doesn't match the provided `sha512sum`
 */
export async function downloadFile(url: string, options?: DownloadOptions): Promise<Buffer> {
  validate(url, schemas.url)
  validate(options, schemas.downloadOptions)

  let data = await download(url)
  if(options?.privateKey != null && options?.publicEncryptionKey != null) {
    data = decrypt(data, options.privateKey, options.publicEncryptionKey)
  }

  if (options?.sha512sum != null && options.sha512sum !== sha512sum(data)) {
    throw new DataIntegrityError()
  }

  return data
}

export interface DownloadOptions {
  /**
   * Asymmetric private key (typically the issuer's) used to calculate decryption key.
   */
  privateKey?: string;
  /**
   * Asymmetric public key (typically the holder's) used to calculate decryption key.
   */
  publicEncryptionKey?: string;
  /**
   * Checksum used to validate the integrity of the downloaded (and possibly decrypted) file
   */
  sha512sum?: string;
}

export class DataIntegrityError extends Error {}

export default downloadFile;
