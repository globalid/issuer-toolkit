export function isRecord(value: unknown): value is Record<string | number | symbol, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isInStringEnum<T>(value: unknown, enumeration: T): value is T {
  return Object.values(enumeration).includes(value);
}
