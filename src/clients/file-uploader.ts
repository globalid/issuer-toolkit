import FormData from 'form-data';

import { DEFAULT_BASE_API_URL, FileType } from '../common';
import * as s3 from '../services/s3';
import * as upload from '../services/upload';
import AccessTokenProvider from '../clients/access-token-provider';

export class FileUploader {
  #accessTokenProvider: AccessTokenProvider;

  constructor(accessTokenProvider: AccessTokenProvider, baseApiUrl = DEFAULT_BASE_API_URL) {
    this.#accessTokenProvider = accessTokenProvider;
    upload.init(baseApiUrl);
  }

  async uploadEncryptedFile(gid_uuid: string, name: string, type: FileType, content: Buffer): Promise<string> {
    const accessToken = await this.#accessTokenProvider.getAccessToken();
    const uploadInfo = await createMediaUpload(accessToken, gid_uuid, {
      type: 'encrypted',
      file_name: name,
      content_type: type
    });
    await uploadFile(content, uploadInfo.s3_upload_url, uploadInfo.s3_upload_fields);
    return `${uploadInfo.base_serve_url}/${uploadInfo.s3_upload_fields.key}`;
  }
}

async function createMediaUpload(
  accessToken: string,
  gid_uuid: string,
  fileInfo: upload.PublicMediaType
): Promise<upload.MediaUploadInfo> {
  const uploadInfos = await upload.uploadFileV2(accessToken, { gid_uuid, media: [fileInfo] });
  if (uploadInfos.length === 0) {
    throw new FileUploadError(fileInfo.file_name);
  }
  return uploadInfos[0];
}

async function uploadFile(content: Buffer, url: string, uploadMetadata: Record<string, string>): Promise<void> {
  const formData = new FormData();
  Object.entries(uploadMetadata).forEach(([name, value]) => {
    formData.append(name, value);
  });
  formData.append('file', content);
  await s3.uploadFile(url, formData);
}

export class FileUploadError extends Error {
  constructor(fileName: string) {
    super(`Failed to upload file ${fileName}`);
  }
}

export default FileUploader;
