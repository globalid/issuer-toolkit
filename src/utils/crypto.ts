import { AES, ED25519, Util } from 'globalid-crypto-library';

/**
 * Decrypts message using X25519 and AES.
 *
 * @param ciphertext - Buffer you want to decrypt
 * @param privateKey - your ED25519 private key
 * @param publicEncryptionKey - X25519 public key of the other party
 */
export function decrypt(ciphertext: Buffer, privateKey: string, publicEncryptionKey: string) {
  const decryptionKey = ED25519.getSharedSecretHex(privateKey, publicEncryptionKey);
  return AES.decryptBuffer(ciphertext, decryptionKey);
}

/**
 * Encrypts message using X25519 and AES.
 *
 * @param plaintext - Buffer you want to encrypt
 * @param privateKey - your ED25519 private key
 * @param publicEncryptionKey - X25519 public key of the other party
 */
export function encrypt(plaintext: Buffer, privateKey: string, publicEncryptionKey: string) {
  const decryptionKey = ED25519.getSharedSecretHex(privateKey, publicEncryptionKey);
  return AES.encryptBuffer(plaintext, decryptionKey);
}

export function sha512sum(data: Buffer): string {
  return Util.hashSHA512(data);
}

export default {
  decrypt,
  encrypt,
  sha512sum
};
