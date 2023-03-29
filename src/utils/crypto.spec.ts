import '../../test/setup';

import * as gidCrypto from 'globalid-crypto-library';

import { decrypt, encrypt, sha512sum } from './crypto';

const plaintext = Buffer.from('Lorem ipsum dolor sit amet');

describe('encrypt and decrypt', () => {
  it('should return plaintext Buffer', () => {
    const [encrypted, key] = encrypt(plaintext)

    const result = decrypt(encrypted, key);

    expect(result).toEqual(plaintext);
  });

  it('should decrypt decryption key when private key is provided', () => {
    const [ciphertext, key] = encrypt(plaintext)
    const { private_key, public_key } = gidCrypto.RSA.generateKeyPair()
    const encryptedDecryptionKey = gidCrypto.RSA.encrypt(public_key, key)

    const result = decrypt(ciphertext, encryptedDecryptionKey, private_key);

    expect(result).toEqual(plaintext);
  });
});

describe('sha512sum', () => {
  it('should delegate to globalid-crypto-library', () => {
    const data = Buffer.from('Lorem ipsum dolor sit amet');
    const cryptoLibraryOutput = gidCrypto.Util.hashSHA512(data)

    const result = sha512sum(data);

    expect(result).toEqual(cryptoLibraryOutput);
  });
});
