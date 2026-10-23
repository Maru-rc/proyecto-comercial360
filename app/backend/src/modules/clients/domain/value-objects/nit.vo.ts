export class Nit {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('El NIT es obligatorio');
    }
    const clean = value.trim();
    if (clean.length < 3 || clean.length > 30) {
      throw new Error('El NIT debe tener entre 3 y 30 caracteres');
    }
    this._value = clean;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Nit): boolean {
    return this._value.toLowerCase() === other._value.toLowerCase();
  }

  toString(): string {
    return this._value;
  }
}
