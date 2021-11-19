import { AES, RSA, Util } from 'globalid-crypto-library';

export const AES_KEY_LENGTH_IN_BYTES = 32;

/**
 * Decrypts the given ciphertext using AES and the given key.
 *
 * If `privateKey` is provided, then the `decryptionKey` is assumed to have been encrypted with RSA and the
 * corresponding public key.
 * @param ciphertext Data to decrypt
 * @param decryptionKey Symmetric key used to decrypt the `ciphertext`
 * @param privateKey Asymmetric private key used to decrypt the `decryptionKey`
 * @returns Plaintext as a `Buffer`
 */
export function decrypt(ciphertext: Buffer, decryptionKey: string, privateKey?: string): Buffer {
  if (privateKey != null) {
    decryptionKey = RSA.decrypt(privateKey, decryptionKey);
  }
  return AES.decryptBuffer(ciphertext, decryptionKey);
}

/**
 * Encrypts the given plaintext using AES and a randomly-generated 256-bit key, which is returned—along with the
 * ciphertext—after being encrypted using RSA and the provided asymmetric public key.
 * @param plaintext Data to encrypt
 * @param publicKey Asymmetric public key used to encrypt the generated symmetric key
 * @returns Ciphertext and encrypted symmetric key as a `Buffer`-`string` pair
 */
export function encrypt(plaintext: Buffer, publicKey: string): [Buffer, string] {
  const key = Util.bytesToHex(Util.randomBytes(AES_KEY_LENGTH_IN_BYTES));
  const ciphertext = AES.encryptBuffer(plaintext, key);
  const encryptedKey = RSA.encrypt(publicKey, key);
  return [ciphertext, encryptedKey];
}

export function sha512sum(data: Buffer): string {
  return Util.hashSHA512(data);
}

export default {
  decrypt,
  encrypt,
  sha512sum
};
