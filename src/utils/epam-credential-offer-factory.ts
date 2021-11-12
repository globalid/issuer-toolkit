import {
  Claims,
  ClaimValue,
  ClaimValueType,
  FileType,
  GidCredentialOffer,
  isFileClaimValue,
  isTypedClaimValue
} from '../common';
import * as epam from '../services/epam';

export function createEpamCredentialOffer(offer: GidCredentialOffer): epam.EpamCreateCredentialsOfferV2 {
  return {
    thread_id: offer.threadId,
    name: offer.name,
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
  if (isFileClaimValue(claimValue)) {
    return {
      name,
      value: JSON.stringify({
        decryption_key: claimValue.decryptionKey,
        media_type: claimValue.type,
        sha_512_sum: claimValue.sha512sum,
        url: claimValue.url
      }),
      value_type: toEpamValueType(claimValue.type)
    };
  } else if (isTypedClaimValue(claimValue)) {
    return {
      name,
      value: String(claimValue.value),
      value_type: toEpamValueType(claimValue.type)
    };
  } else {
    return {
      name,
      value: String(claimValue),
      value_type: toEpamValueType(typeof claimValue)
    };
  }
}

function toEpamValueType(type: string | ClaimValueType | FileType): epam.ValueType {
  switch (type) {
    case FileType.JPEG:
      return epam.ValueType.image_jpeg;
    case FileType.PNG:
      return epam.ValueType.image_png;
    case ClaimValueType.Boolean:
      return epam.ValueType.boolean;
    case ClaimValueType.Date:
      return epam.ValueType.date;
    case ClaimValueType.DateTime:
      return epam.ValueType.date_time;
    case ClaimValueType.Integer:
      return epam.ValueType.integer;
    case ClaimValueType.Number:
      return epam.ValueType.number;
    case ClaimValueType.Time:
      return epam.ValueType.time;
    case ClaimValueType.String:
    default:
      return epam.ValueType.string;
  }
}

export default createEpamCredentialOffer;
