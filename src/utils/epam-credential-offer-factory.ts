import {
  Claims,
  ClaimValue,
  CredentialOffer,
  DirectCredentialOfferWithGidUuid,
  DirectCredentialOfferWithThreadId,
  isFileClaimValue
} from '../common';
import * as epam from '../services/epam';

export function createEpamCredentialOffer(offer: CredentialOffer): epam.EpamCreateCredentialsOfferV2 {
  return {
    attributes: toAttributes(offer.claims),
    context_uri: offer.contextUri,
    description: offer.description,
    expiration_date: offer.expirationDate,
    name: offer.name,
    schema_uri: offer.schemaUri,
    subject_type: offer.subjectType,
    thread_id: offer.threadId
  };
}

export function createEpamDirectCredentialOffer(
  offer: DirectCredentialOfferWithThreadId | DirectCredentialOfferWithGidUuid
): epam.EpamCreateDirectCredentialOfferWithGidUuid | epam.EpamCreateDirectCredentialOfferWithThreadId {
  const prepared: epam.EpamCreateDirectCredentialOffer = {
    auto_issue: offer.autoIssue,
    name: offer.name,
    description: offer.description,
    context_uri: <string>offer.contextUri,
    subject_type: offer.subjectType,
    schema_uri: <string>offer.schemaUri,
    attributes: toAttributes(offer.claims)
  };

  if ((<Partial<DirectCredentialOfferWithGidUuid>>offer).gidUuid !== undefined) {
    return {
      ...prepared,
      gid_uuid: (<DirectCredentialOfferWithGidUuid>offer).gidUuid
    };
  } else {
    return {
      ...prepared,
      thread_id: (<DirectCredentialOfferWithThreadId>offer).threadId
    };
  }
}

function toAttributes(claims: Claims): epam.Attributes {
  const attributes = Object.entries(claims).reduce<[string, epam.AttributeValue][]>((attributes, [name, value]) => {
    if (value != null) {
      attributes.push([name, toAttributeValue(value)]);
    }
    return attributes;
  }, []);
  return Object.fromEntries(attributes);
}

function toAttributeValue(value: ClaimValue): epam.AttributeValue {
  if (isFileClaimValue(value)) {
    return {
      decryption_key: value.decryptionKey,
      file_name: value.name,
      media_type: value.type,
      sha_512_sum: value.sha512sum,
      url: value.url
    };
  } else {
    return value;
  }
}

export default createEpamCredentialOffer;
