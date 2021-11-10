import * as gidCrypto from 'globalid-crypto-library';
import { mocked } from 'ts-jest/utils';

import { publicKey } from '../../test/stubs';
import { AES_KEY_LENGTH, encrypt } from './crypto';

jest.mock('globalid-crypto-library');

const mockedAesEncryptBuffer = mocked(gidCrypto.AES.encryptBuffer);
const mockedBytesToHex = mocked(gidCrypto.Util.bytesToHex);
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
    expect(mockedRandomBytes).toHaveBeenCalledWith(AES_KEY_LENGTH / 8);
    expect(mockedBytesToHex).toHaveBeenCalledTimes(1);
    expect(mockedBytesToHex).toHaveBeenCalledWith(randomBytes);
    expect(mockedAesEncryptBuffer).toHaveBeenCalledTimes(1);
    expect(mockedAesEncryptBuffer).toHaveBeenCalledWith(plaintext, key);
    expect(mockedRsaEncrypt).toHaveBeenCalledTimes(1);
    expect(mockedRsaEncrypt).toHaveBeenCalledWith(publicKey, key);
  });
});
