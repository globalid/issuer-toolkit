import { AES, Util } from 'globalid-crypto-library';

export const AES_KEY_BYTES = 32;

/**
 * Decrypts the given ciphertext using AES and the given key.
 *
 * If `privateKey` is provided, then the `decryptionKey` is assumed to have been encrypted with RSA and the
 * corresponding public key.
 * @param ciphertext Data to decrypt
 * @param decryptionKey Symmetric key used to decrypt the `ciphertext`
 * @returns Plaintext as a `Buffer`
 */
export function decrypt(ciphertext: Buffer, decryptionKey: string): Buffer {
  return AES.decryptBuffer(ciphertext, decryptionKey);
}

/**
 * Encrypts the given plaintext using AES and a randomly-generated 256-bit key, which is returned—along with the
 * ciphertext—after being encrypted using RSA and the provided asymmetric public key.
 * @param plaintext Data to encrypt
 * @returns Ciphertext and encrypted symmetric key as a `Buffer`-`string` pair
 */
export function encrypt(plaintext: Buffer): [Buffer, string] {
  const key = Util.bytesToHex(Util.randomBytes(AES_KEY_BYTES));
  const ciphertext = AES.encryptBuffer(plaintext, key);

  return [ciphertext, key];
}

export function sha512sum(data: Buffer): string {
  return Util.hashSHA512(data);
}

export default {
  decrypt,
  encrypt,
  sha512sum
};
