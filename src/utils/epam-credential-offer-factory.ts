import { Claims, ClaimValue, GidCredentialOffer } from '../common';
import * as epam from '../services/epam';

export function createEpamCredentialOffer(offer: GidCredentialOffer): epam.EpamCreateCredentialsOfferV2 {
  return {
    thread_id: offer.threadId,
    schema_url: offer.contextIri,
    schema_type: offer.subjectType,
    credential_attributes: createCredentialAttributes(offer.claims)
  };
}

function createCredentialAttributes(claims: Claims): epam.CredentialAttributesV2[] {
  return Object.entries(claims).map(([key, value]) => createCredentialAttribute(key, value));
}

function createCredentialAttribute(name: string, claimValue: ClaimValue): epam.CredentialAttributesV2 {
  return {
    name,
    value: String(claimValue.value),
    mime_type: claimValue.type
  };
}

export default createEpamCredentialOffer;
