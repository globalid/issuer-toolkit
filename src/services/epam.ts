import axios from 'axios';
import { ProofRequirementAttributes } from './interfaces';

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

export async function createProofRequest(
  accessToken: string,
  body: EpamCreateProofRequestBody
): Promise<EpamCreateProofRequestResponse> {
  return (
    await axios.request<EpamCreateProofRequestResponse>({
      url: '/v2/aries-management/external-party/proof-requests',
      baseURL: baseUrl,
      method: 'post',
      data: body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  ).data;
}

export interface EpamCreateCredentialsOfferV2 {
  thread_id: string;
  name: string;
  description?: string;
  context_uri: string;
  subject_type: string;
  schema_uri: string;
  attributes: Attributes;
}

export interface EpamCredentialErrorReportBody {
  thread_id: string;
  code: string;
  description: string;
}

export interface EpamCreateProofRequestBody {
  proof_requirements: ProofRequirementAttributes;
  tracking_id: string;
  screening_webhook_url: string;
}

export interface EpamCreateProofRequestResponse {
  pres_request: object;
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
