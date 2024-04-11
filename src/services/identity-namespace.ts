import axios from 'axios';

let baseUrl: string;

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl;
}

export async function getIdentityPublic(gidUuid: string): Promise<Identity> {
  const response = await axios.request<Identity>({
    url: `/v1/directory/${gidUuid}`,
    baseURL: baseUrl,
    method: 'get'
  });
  return response.data;
}

export enum IdentityType {
  USEER = 'USER',
  ORG = 'ORG',
  APP = 'APP'
}

export interface Identity {
  name: string;
  gid_uuid: string;
  display_name?: string;
  profile_photo: string;
  public_key: string;
  type: IdentityType;
  created_at: string;
}
