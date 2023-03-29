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

const fileNamePattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}[-_.]\w+\.[a-z]+$/i;

const schemas = {
  credentialOffer: Joi.object<CredentialOffer>({
    claims: Joi.object().pattern(/.*/, claimValueSchema).required(),
    contextUri: uriSchema,
    description: Joi.string(),
    name: Joi.string().required(),
    schemaUri: uriSchema,
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
    publicEncryptionKey: Joi.string(),
    sha512sum: Joi.string()
  }).unknown(),

  errorCode: Joi.string()
    .valid(...Object.values(ErrorCodes))
    .required(),

  fileObject: Joi.object({
    content: Joi.binary().required(),
    name: Joi.string().pattern(fileNamePattern).required(),
    type: fileTypeSchema.required()
  })
    .required()
    .unknown(),

  gidIssuerClientOptions: Joi.object({
    baseApiUrl: uriSchema,
    baseSsiUrl: uriSchema,
    baseAuthUrl: uriSchema
  }).unknown(),

  requiredString: Joi.string().required(),

  url: uriSchema.required(),

  uuid: uuidSchema.required()
};

export default schemas;
