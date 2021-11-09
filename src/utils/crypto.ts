import { AES, RSA, Util } from 'globalid-crypto-library';

export const AES_KEY_LENGTH = 256;

export function encrypt(plaintext: Buffer, publicKey: string): [Buffer, string] {
  const key = Util.bytesToHex(Util.randomBytes(AES_KEY_LENGTH / 8));
  const ciphertext = AES.encryptBuffer(plaintext, key);
  const encryptedKey = RSA.encrypt(publicKey, key);
  return [ciphertext, encryptedKey];
}
