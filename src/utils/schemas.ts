import Joi from 'joi';

import { ErrorCodes } from '../clients/epam-client';
import { CredentialOffer, CredentialRequest, FileClaimValue, FileType } from '../common';

const fileTypeSchema = Joi.string().valid(...Object.values(FileType));

const uriSchema = Joi.string().uri();

const uuidSchema = Joi.string().uuid();

const fileClaimValueSchema = Joi.object<FileClaimValue>({
  decryptionKey: Joi.string().required(),
  sha512sum: Joi.string().required(),
  type: fileTypeSchema.required(),
  url: uriSchema.required()
}).unknown();

const claimValueSchema = [Joi.boolean(), Joi.number(), Joi.string().allow(''), fileClaimValueSchema];

const schemas = {
  credentialOffer: Joi.object<CredentialOffer>({
    claims: Joi.object().pattern(/.*/, claimValueSchema).required(),
    contextUri: uriSchema.required(),
    description: Joi.string(),
    name: Joi.string().required(),
    schemaUri: uriSchema.required(),
    subjectType: Joi.string().required(),
    threadId: Joi.string().required()
  })
    .required()
    .unknown(),

  credentialRequest: Joi.object<CredentialRequest>({
    data: Joi.any(),
    gidUuid: uuidSchema.required(),
    signature: Joi.string().required(),
    threadId: Joi.string().required(),
    timestamp: Joi.number().integer().positive().required()
  })
    .required()
    .unknown(),

  downloadOptions: Joi.object({
    decryptionKey: Joi.string(),
    privateKey: Joi.string(),
    sha512sum: Joi.string()
  }).unknown(),

  errorCode: Joi.string()
    .valid(...Object.values(ErrorCodes))
    .required(),

  fileObject: Joi.object({
    content: Joi.binary().required(),
    name: Joi.string().required(),
    type: fileTypeSchema.required()
  })
    .required()
    .unknown(),

  gidClientOptions: Joi.object({
    baseApiUrl: uriSchema,
    baseSsiUrl: uriSchema
  }).unknown(),

  requiredString: Joi.string().required(),

  url: uriSchema.required(),

  uuid: uuidSchema.required()
};

export default schemas;
