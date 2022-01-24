import Joi from 'joi';

export function validate(value: unknown, schema: Joi.Schema): void {
  const { error } = schema.validate(value);
  if (error != null) {
    throw new TypeError(error.message);
  }
}

export { default as schemas } from './schemas';
