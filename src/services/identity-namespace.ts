import axios from 'axios';

let baseUrl: string;

export function init(serviceUrl: string): void {
  baseUrl = serviceUrl;
}

export async function getIdentityPublic(gidUuid: string): Promise<Identity> {
  let response;
  try {
    response = await axios.request<Identity>({
      url: `/v1/identities/${gidUuid}`,
      baseURL: baseUrl,
      method: 'get'
    });
    return response.data;
  } catch (e) {
    console.log('getIdentityPublic: ', {
      response,
      e
    });

    throw e;
  }
}

export interface Identity extends PrivateIdentity {
  purpose_personal?: boolean;
  purpose_professional?: boolean;
  purpose_recreational?: boolean;
  display_name?: string;
  description?: string;
  display_image_url?: string;
  region_code?: string;
  region_name?: string;
  country_code?: string;
  country_name?: string;
  state_code?: string;
  state_name?: string;
  metro_code?: string;
  metro_name?: string;
  signup_type?: IdentitySignupType;
  encrypted_signup_challenge?: string;
  profile_picture_verified?: boolean;
}

export interface PrivateIdentity {
  gid_uuid: string;
  gid_name: string;
  type: string;
  status: string;
  created_at: string;
  released_at?: string;
  completed: boolean;
  gid_name_moderation_status: string;
  public_signing_key: string;
  public_encryption_key: string;
  signup_type?: IdentitySignupType;
  is_private: boolean;
  has_wallet: boolean;
}

export enum IdentitySignupType {
  Localid = 'localid',
  Globalid = 'globalid'
}
