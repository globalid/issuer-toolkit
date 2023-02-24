import '../../test/setup';

import * as gidCrypto from 'globalid-crypto-library';

import { privateKey } from '../../test/stubs';
import { AES_KEY_LENGTH_IN_BYTES, decrypt, encrypt, sha512sum } from './crypto';

jest.mock('globalid-crypto-library');

const plaintext = Buffer.from('Lorem ipsum dolor sit amet');
const ciphertext = Buffer.from('abcdefghijklmnopqrstuvwxyz');
const decryptionKey = 'foobar';
const encryptedDecryptionKey = 'irredu';

describe('decrypt', () => {
  const mockedAesDecryptBuffer = jest.mocked(gidCrypto.AES.decryptBuffer);
  const mockedRsaDecrypt = jest.mocked(gidCrypto.RSA.decrypt);

  it('should return plaintext Buffer', () => {
    mockedAesDecryptBuffer.mockReturnValueOnce(plaintext);

    const result = decrypt(ciphertext, decryptionKey);

    expect(result).toBe(plaintext);
    expect(mockedAesDecryptBuffer).toHaveBeenCalledTimes(1);
    expect(mockedAesDecryptBuffer).toHaveBeenCalledWith(ciphertext, decryptionKey);
    expect(mockedRsaDecrypt).not.toHaveBeenCalled();
  });

  it('should decrypt decryption key when private key is provided', () => {
    mockedRsaDecrypt.mockReturnValueOnce(decryptionKey);
    mockedAesDecryptBuffer.mockReturnValueOnce(plaintext);

    const result = decrypt(ciphertext, encryptedDecryptionKey, privateKey);

    expect(result).toBe(plaintext);
    expect(mockedRsaDecrypt).toHaveBeenCalledTimes(1);
    expect(mockedRsaDecrypt).toHaveBeenCalledWith(privateKey, encryptedDecryptionKey);
    expect(mockedAesDecryptBuffer).toHaveBeenCalledTimes(1);
    expect(mockedAesDecryptBuffer).toHaveBeenCalledWith(ciphertext, decryptionKey);
  });
});

describe('encrypt', () => {
  const mockedAesEncryptBuffer = jest.mocked(gidCrypto.AES.encryptBuffer);
  const mockedBytesToHex = jest.mocked(gidCrypto.Util.bytesToHex);
  const mockedRandomBytes = jest.mocked(gidCrypto.Util.randomBytes);

  it('should return ciphertext Buffer and encrypted key', () => {
    const randomBytes = [1, 2, 3];
    mockedRandomBytes.mockReturnValueOnce(randomBytes);
    mockedBytesToHex.mockReturnValueOnce(decryptionKey);
    mockedAesEncryptBuffer.mockReturnValueOnce(ciphertext);

    const result = encrypt(plaintext);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(ciphertext);
    expect(result[1]).toBe(decryptionKey);
    expect(mockedRandomBytes).toHaveBeenCalledTimes(1);
    expect(mockedRandomBytes).toHaveBeenCalledWith(AES_KEY_LENGTH_IN_BYTES);
    expect(mockedBytesToHex).toHaveBeenCalledTimes(1);
    expect(mockedBytesToHex).toHaveBeenCalledWith(randomBytes);
    expect(mockedAesEncryptBuffer).toHaveBeenCalledTimes(1);
    expect(mockedAesEncryptBuffer).toHaveBeenCalledWith(plaintext, decryptionKey);
  });
});

describe('sha512sum', () => {
  const mockedHashSha512 = jest.mocked(gidCrypto.Util.hashSHA512);

  it('should delegate to globalid-crypto-library', () => {
    const data = Buffer.from('Lorem ipsum dolor sit amet');
    const output = 'abcdefghijklmnopqrstuvwxyz0123456789';
    mockedHashSha512.mockReturnValueOnce(output);

    const result = sha512sum(data);

    expect(result).toBe(output);
    expect(mockedHashSha512).toHaveBeenCalledTimes(1);
    expect(mockedHashSha512).toHaveBeenCalledWith(data);
  });
});
