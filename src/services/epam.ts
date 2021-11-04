import axios from 'axios';

let baseUrl: string;

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl;
}

export async function createCredentialOfferV2(accessToken: string, body: EpamCreateCredentialsOfferV2): Promise<void> {
  const response = await axios.request<void>({
    url: '/v2/aries-management/external-party/credentials/offers',
    baseURL: baseUrl,
    method: 'post',
    data: body,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
}

export async function createErrorReport(accessToken: string, body: EpamCredentialErrorReportBody): Promise<void> {
  const response = await axios.request<void>({
    url: '/v2/aries-management/external-party/credentials/error-reports',
    baseURL: baseUrl,
    method: 'post',
    data: body,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.data;
}

export interface EpamCreateCredentialsOfferV2 {
  thread_id: string;
  name: string;
  description?: string;
  schema_url: string;
  schema_type: string;
  attributes: CredentialAttributesV2[];
}

export interface CredentialAttributesV2 {
  name: string;
  value: string;
  value_type: ValueType;
}

export enum ValueType {
  boolean = 'boolean',
  integer = 'integer',
  number = 'number',
  string = 'string',
  date = 'date',
  time = 'time',
  date_time = 'date-time',
  image_png = 'image/png',
  image_jpeg = 'image/jpeg'
}

export interface EpamCredentialErrorReportBody {
  thread_id: string;
  code: string;
  description: string;
}
