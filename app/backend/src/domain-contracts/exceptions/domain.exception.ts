/**
 * Clase base para todas las excepciones de dominio y aplicación en Comercial360.
 * Completamente desacoplada del protocolo HTTP y de frameworks (Uncle Bob - Clean Architecture).
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
