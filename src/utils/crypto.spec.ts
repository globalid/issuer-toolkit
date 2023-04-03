import '../../test/setup';

import * as gidCrypto from 'globalid-crypto-library';

import { decrypt, encrypt, sha512sum } from './crypto';

const plaintext = Buffer.from('Lorem ipsum dolor sit amet');

describe('crypto', () => {
  it('should encrypt/decrypt', () => {
    const [encrypted, decryptionKey] = encrypt(plaintext);

    const result = decrypt(encrypted, decryptionKey);

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
