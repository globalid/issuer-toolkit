import { Claims, ClaimValue, CredentialOffer, isFileClaimValue } from '../common';
import * as epam from '../services/epam';

export function createEpamCredentialOffer(offer: CredentialOffer): epam.EpamCreateCredentialsOfferV2 {
  return {
    thread_id: offer.threadId,
    name: offer.name,
    description: offer.description,
    context_uri: offer.contextUri,
    schema_uri: offer.schemaUri,
    subject_type: offer.subjectType,
    attributes: toAttributes(offer.claims)
  };
}

function toAttributes(claims: Claims): epam.Attributes {
  return Object.fromEntries(Object.entries(claims).map(([name, value]) => [name, toAttributeValue(value)]));
}

function toAttributeValue(value: ClaimValue): epam.AttributeValue {
  if (isFileClaimValue(value)) {
    return {
      decryption_key: value.decryptionKey,
      media_type: value.type,
      sha_512_sum: value.sha512sum,
      url: value.url
    };
  } else {
    return value;
  }
}

export default createEpamCredentialOffer;
