import axios from 'axios';

let baseUrl: string;

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl;
}

export async function uploadFileV2(accessToken: string, body: PublicMediaRequestBody): Promise<MediaUploadInfo[]> {
  return (
    await axios.request<MediaUploadInfo[]>({
      baseURL: baseUrl,
      url: `/v2/upload`,
      method: 'post',
      data: body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  ).data;
}

export interface PublicMediaRequestBody {
  media: PublicMediaType[];
}

export interface PublicMediaType {
  type: UploadType;
  file_name: string;
  content_type: string;
}

export type UploadType = 'image' | 'video' | 'other' | 'encrypted';

export interface MediaUploadInfo {
  s3_upload_url: string;
  s3_upload_fields: Record<string, string>;
  base_serve_url: string;
  original_filename: string;
  media_id: string;
  thumbnail_serve_url?: string;
}
