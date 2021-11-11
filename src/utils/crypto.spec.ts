import * as gidCrypto from 'globalid-crypto-library';
import { mocked } from 'ts-jest/utils';

import { publicKey } from '../../test/stubs';
import { AES_KEY_LENGTH_IN_BYTES, encrypt, sha512sum } from './crypto';

jest.mock('globalid-crypto-library');

const mockedAesEncryptBuffer = mocked(gidCrypto.AES.encryptBuffer);
const mockedBytesToHex = mocked(gidCrypto.Util.bytesToHex);
const mockedHashSha512 = mocked(gidCrypto.Util.hashSHA512);
const mockedRandomBytes = mocked(gidCrypto.Util.randomBytes);
const mockedRsaEncrypt = mocked(gidCrypto.RSA.encrypt);

describe('encrypt', () => {
  it('should return ciphertext and encrypted key', () => {
    const plaintext = Buffer.from('Lorem ipsum dolor sit amet');
    const ciphertext = Buffer.from('abcdefghijklmnopqrstuvwxyz');
    const key = 'foobar';
    const encryptedKey = 'irredu';
    const randomBytes = [1, 2, 3];
    mockedRandomBytes.mockReturnValueOnce(randomBytes);
    mockedBytesToHex.mockReturnValueOnce(key);
    mockedAesEncryptBuffer.mockReturnValueOnce(ciphertext);
    mockedRsaEncrypt.mockReturnValueOnce(encryptedKey);

    const result = encrypt(plaintext, publicKey);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(ciphertext);
    expect(result[1]).toEqual(encryptedKey);
    expect(mockedRandomBytes).toHaveBeenCalledTimes(1);
    expect(mockedRandomBytes).toHaveBeenCalledWith(AES_KEY_LENGTH_IN_BYTES);
    expect(mockedBytesToHex).toHaveBeenCalledTimes(1);
    expect(mockedBytesToHex).toHaveBeenCalledWith(randomBytes);
    expect(mockedAesEncryptBuffer).toHaveBeenCalledTimes(1);
    expect(mockedAesEncryptBuffer).toHaveBeenCalledWith(plaintext, key);
    expect(mockedRsaEncrypt).toHaveBeenCalledTimes(1);
    expect(mockedRsaEncrypt).toHaveBeenCalledWith(publicKey, key);
  });
});

describe('sha512sum', () => {
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
