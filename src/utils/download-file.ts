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
   * Symmetric key used to decrypt the downloaded file via AES
   */
  decryptionKey?: string;
  /**
   * Asymmetric private key used to decrypt the `decryptionKey` via RSA
   */
  privateKey?: string;
  /**
   * Used to validate the checksum of the downloaded file
   */
  sha512sum?: string;
}

export class DataIntegrityError extends Error {}

export default downloadFile;
