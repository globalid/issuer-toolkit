import { Claims, ClaimValue, GidCredentialOffer, PrimitiveClaimValueType } from '../common';
import * as epam from '../services/epam';

export function createEpamCredentialOffer(offer: GidCredentialOffer): epam.EpamCreateCredentialsOfferV2 {
  return {
    thread_id: offer.threadId,
    name: offer.title,
    description: offer.description,
    schema_url: offer.contextIri,
    schema_type: offer.subjectType,
    attributes: createCredentialAttributes(offer.claims)
  };
}

function createCredentialAttributes(claims: Claims): epam.CredentialAttributesV2[] {
  return Object.entries(claims).map(([key, value]) => createCredentialAttribute(key, value));
}

function createCredentialAttribute(name: string, claimValue: ClaimValue): epam.CredentialAttributesV2 {
  return {
    name,
    value: String(claimValue.value),
    value_type: toEpamValueType(claimValue.type)
  };
}

function toEpamValueType(type: PrimitiveClaimValueType): epam.ValueType {
  switch (type) {
    case PrimitiveClaimValueType.Boolean:
      return epam.ValueType.boolean;
    case PrimitiveClaimValueType.Integer:
      return epam.ValueType.integer;
    case PrimitiveClaimValueType.Number:
      return epam.ValueType.number;
    case PrimitiveClaimValueType.String:
      return epam.ValueType.string;
    case PrimitiveClaimValueType.Date:
      return epam.ValueType.date;
    case PrimitiveClaimValueType.Time:
      return epam.ValueType.time;
    case PrimitiveClaimValueType.DateTime:
      return epam.ValueType.date_time;
  }
}

export default createEpamCredentialOffer;
