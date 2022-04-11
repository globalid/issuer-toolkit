export enum ProofAlgorithm {
  BbsBlsSignature2020 = 'BbsBlsSignature2020'
}

export interface ProofType {
  proof_type: ProofAlgorithm[];
}

export interface ProofRequirementFormat {
  ldp_vp?: ProofType;
  ldp_vc?: ProofType;
}

export interface InputDescriptorsSchemaOneofFilter {
  required?: boolean;
  uri: string;
}

export type UnknownRecord = Record<string, unknown>;

interface InputDescriptorsSchema {
  oneof_filter?: InputDescriptorsSchemaOneofFilter[];
}

export enum RequirementStatus {
  required = 'required',
  preferred = 'preferred'
}

export interface InputDescriptorsConstraintsIsHolder {
  directive: string;
  field_id: string[];
}

export enum AllowanceStatus {
  allowed = 'allowed',
  disallowed = 'disallowed'
}

export enum RequiredStatus {
  allowed = 'allowed',
  disallowed = 'disallowed',
  required = 'required'
}

export interface InputDescriptorsConstraintsFields {
  id?: string;
  path: string[];
  purpose?: string;
  filter?: InputDescriptorsConstraintsFilter;
}

export interface InputDescriptorsConstraintsFilter {
  maximum?: string | number;
  minimum?: string | number;
  type?: FilterValueType;
  format?: FilterValueTypeDate;
  const?: string | number;
  enum?: string[] | number[];
  exclusiveMaximum?: string | number;
  exclusiveMinimum?: string | number;
  maxLength?: number;
  mimLength?: number;
  not?: boolean;
  pattern?: string;
}

export enum FilterValueType {
  string = 'string',
  number = 'number'
}

export enum FilterValueTypeDate {
  date = 'date',
  date_time = 'date-time'
}

export interface InputDescriptorsConstraints {
  limit_disclosure: RequirementStatus;
  is_holder?: InputDescriptorsConstraintsIsHolder[];
  status_active?: AllowanceStatus;
  status_revoked?: AllowanceStatus;
  status_suspended?: RequiredStatus;
  subject_is_issuer?: RequirementStatus;
  fields: InputDescriptorsConstraintsFields[];
}

export interface InputDescriptors {
  id: string;
  name: string;
  group?: string[];
  metadata?: UnknownRecord;
  schema: InputDescriptorsSchema | InputDescriptorsSchemaOneofFilter[];
  constraints: InputDescriptorsConstraints;
}

export interface ProofRequirementAttributes {
  name?: string;
  purpose?: string;
  id: string;
  format: ProofRequirementFormat;
  input_descriptors: InputDescriptors[];
}
