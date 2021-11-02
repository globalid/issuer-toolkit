import axios from 'axios'

let baseUrl: string

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl
}

export async function createCredentialOfferV2(access_token: string, body: EpamCreateCredentialsOfferV2): Promise<void> {
  const response = await axios.request<void>({
    url: '/v2/aries-management/external-party/credentials/offers',
    baseURL: baseUrl,
    method: "post",
    data: body,
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
  return response.data;
}

export async function createErrorReport(access_token: string, body: EpamCredentialErrorReportBody): Promise<void> {
  const response = await axios.request<void>({
    url: '/v2/aries-management/external-party/credentials/error-reports',
    baseURL: baseUrl,
    method: "post",
    data: body,
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
  return response.data;
}

export interface EpamCreateCredentialsOfferV2 {
  thread_id: string;
  schema_url: string;
  schema_type: string;
  credential_attributes: CredentialAttributesV2[];
}

export interface CredentialAttributesV2 {
  name: string;
  mime_type: string;
  value: string;
}

export interface EpamCredentialErrorReportBody {
  thread_id: string;
  code: string;
  description: string;
}
