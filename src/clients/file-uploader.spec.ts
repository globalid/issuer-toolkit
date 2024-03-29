import '../../test/setup';

import FormData from 'form-data';

import { accessToken, clientId, clientSecret, stub } from '../../test/stubs';
import { FileType } from '../common';
import * as s3 from '../services/s3';
import * as upload from '../services/upload';
import AccessTokenProvider from './access-token-provider';
import { FileUploader, FileUploadError } from './file-uploader';

jest.mock('form-data');
jest.mock('../services/s3');
jest.mock('../services/upload');
jest.mock('./access-token-provider');

const MockedFormData = jest.mocked(FormData);
const mockedS3UploadFile = jest.mocked(s3.uploadFile);
const mockedUploadFileV2 = jest.mocked(upload.uploadFileV2);

describe('FileUploader', () => {
  let accessTokenProvider: AccessTokenProvider;
  let fileUploader: FileUploader;

  beforeEach(() => {
    accessTokenProvider = new AccessTokenProvider(clientId, clientSecret);
    fileUploader = new FileUploader(accessTokenProvider);
  });

  describe('#uploadEncryptedFile', () => {
    const gid_uuid = '950db7ed-d4fa-4b7f-b39f-e87268e2d029';
    const name = 'foo.jpg';
    const type = FileType.JPEG;
    const content = Buffer.from('definitely a valid image');

    it('should upload file as encrypted media', async () => {
      const mediaUploadInfo = stub<upload.MediaUploadInfo>({
        base_serve_url: 'https://example.com/uploads',
        s3_upload_url: 'https://example.com/s3-upload',
        s3_upload_fields: {
          foo: 'bar',
          bar: 'baz',
          key: 'some-key'
        }
      });
      mockedUploadFileV2.mockResolvedValueOnce([mediaUploadInfo]);

      const url = await fileUploader.uploadEncryptedFile(gid_uuid, name, type, content);

      expect(url).toBe('https://example.com/uploads/some-key');
      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedUploadFileV2).toHaveBeenCalledTimes(1);
      expect(mockedUploadFileV2).toHaveBeenCalledWith(accessToken, {
        gid_uuid,
        media: [
          {
            type: 'encrypted',
            file_name: name,
            content_type: type
          }
        ]
      });
      expect(MockedFormData).toHaveBeenCalledTimes(1);
      expect(MockedFormData.mock.instances[0].append).toHaveBeenCalledTimes(4);
      expect(MockedFormData.mock.instances[0].append).toHaveBeenNthCalledWith(1, 'foo', 'bar');
      expect(MockedFormData.mock.instances[0].append).toHaveBeenNthCalledWith(2, 'bar', 'baz');
      expect(MockedFormData.mock.instances[0].append).toHaveBeenNthCalledWith(3, 'key', 'some-key');
      expect(MockedFormData.mock.instances[0].append).toHaveBeenNthCalledWith(4, 'file', content);
      expect(mockedS3UploadFile).toHaveBeenCalledTimes(1);
      expect(mockedS3UploadFile).toHaveBeenCalledWith(mediaUploadInfo.s3_upload_url, MockedFormData.mock.instances[0]);
    });

    it('should throw error if upload service fails', async () => {
      mockedUploadFileV2.mockResolvedValueOnce([]);

      await expect(fileUploader.uploadEncryptedFile(gid_uuid, name, type, content)).rejects.toThrow(FileUploadError);
      expect(accessTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedUploadFileV2).toHaveBeenCalledTimes(1);
      expect(mockedUploadFileV2).toHaveBeenCalledWith(accessToken, {
        gid_uuid,
        media: [
          {
            type: 'encrypted',
            file_name: name,
            content_type: type
          }
        ]
      });
      expect(MockedFormData).not.toHaveBeenCalled();
      expect(mockedS3UploadFile).not.toHaveBeenCalled();
    });
  });
});
