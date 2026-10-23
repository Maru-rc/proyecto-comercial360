/**
 * Base class for all domain and application exceptions in Comercial360.
 * Completely decoupled from HTTP protocol and external frameworks (Uncle Bob - Clean Architecture).
 */
export abstract class DomainException extends Error {
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
