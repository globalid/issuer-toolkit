import Joi from 'joi';
import { validate } from './validation';

describe('validate', () => {
  const schema = Joi.number().min(1);

  it('should not throw error for valid value', () => {
    expect(() => validate(42, schema)).not.toThrow();
  });

  it('should throw TypeError for invalid value', () => {
    expect(() => validate(-69, schema)).toThrow(TypeError);
  });
});
