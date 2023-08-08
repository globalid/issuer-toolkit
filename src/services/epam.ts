import axios from 'axios';

let baseUrl: string;

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl;
}

export async function createCredentialOfferV2(
  accessToken: string,
  body: EpamCreateCredentialsOfferV2,
  appUuid?: string
): Promise<void> {
  const response = await axios.request<void>({
    url: '/v2/aries-management/external-party/credentials/offers',
    baseURL: baseUrl,
    method: 'post',
    data: body,
    headers: {
      'x-app-uuid': appUuid,
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
}

export async function createDirectCredentialOffer(
  accessToken: string,
  body: EpamCreateDirectCredentialOffer,
  appUuid?: string
): Promise<void> {
  const response = await axios.request<void>({
    url: 'v2/aries-management/external-party/credentials/direct-offers',
    baseURL: baseUrl,
    method: 'post',
    data: body,
    headers: {
      'x-app-uuid': appUuid,
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
}

export async function createErrorReport(
  accessToken: string,
  body: EpamCredentialErrorReportBody,
  appUuid?: string
): Promise<void> {
  const response = await axios.request<void>({
    url: '/v2/aries-management/external-party/credentials/error-reports',
    baseURL: baseUrl,
    method: 'post',
    data: body,
    headers: {
      'x-app-uuid': appUuid,
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
}

export interface EpamCreateCredentialsOfferV2 {
  attributes: Attributes;
  context_uri?: string;
  description?: string;
  expiration_date?: string;
  name: string;
  schema_uri?: string;
  subject_type: string;
  thread_id: string;
}

export class EpamCreateDirectCredentialOffer {
  id?: string;
  gid_uuid!: string;
  name!: string;
  description?: string;
  context_uri!: string;
  subject_type!: string;
  schema_uri!: string;
  attributes!: Record<string, unknown>;
}

export interface EpamCredentialErrorReportBody {
  thread_id: string;
  code: string;
  description: string;
}

// custom types
export type Attributes = Record<string, AttributeValue>;
export type AttributeValue = boolean | number | string | FileAttribute;
export interface FileAttribute {
  decryption_key: string;
  file_name: string;
  media_type: string;
  sha_512_sum: string;
  url: string;
}
