import { AES, RSA, Util } from 'globalid-crypto-library';

export const AES_KEY_LENGTH_IN_BYTES = 32;

/**
 * Encrypts the given plaintext using AES and a randomly-generated 256-bit key, which is returned—along with the
 * ciphertext—after being encrypted using RSA and the provided asymmetric public key.
 * @param plaintext Data to be encrypted
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
  encrypt,
  sha512sum
};
