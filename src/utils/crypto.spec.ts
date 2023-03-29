import '../../test/setup';

import * as gidCrypto from 'globalid-crypto-library';

import { decrypt, encrypt, sha512sum } from './crypto';

const plaintext = Buffer.from('Lorem ipsum dolor sit amet');

describe('encrypt and decrypt', () => {
  it('should use X25519 and AES to encrypt/decrypt', () => {
    const alice = gidCrypto.ED25519.generateKeys();
    const bob = gidCrypto.ED25519.generateKeys();
    const encrypted = encrypt(plaintext, alice.privateKey, bob.publicEncryptionKey);

    const result = decrypt(encrypted, bob.privateKey, alice.publicEncryptionKey);

    expect(result).toEqual(plaintext);
  });
});

describe('sha512sum', () => {
  it('should delegate to globalid-crypto-library', () => {
    const data = Buffer.from('Lorem ipsum dolor sit amet');
    const cryptoLibraryOutput = gidCrypto.Util.hashSHA512(data);

    const result = sha512sum(data);

    expect(result).toEqual(cryptoLibraryOutput);
  });
});
