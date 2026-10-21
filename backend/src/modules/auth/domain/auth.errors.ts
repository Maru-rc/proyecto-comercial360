// Errores de negocio de la autorización. La capa de presentación los
// convierte en 403 Forbidden (ver DomainErrorsFilter).

/** Un usuario ASESOR que no tiene registro en la tabla ASESOR. */
export class AsesorNoVinculadoError extends Error {
  constructor(email: string) {
    super(`No existe un asesor vinculado al correo ${email}`);
    this.name = 'AsesorNoVinculadoError';
  }
}

/** Un asesor intentó acceder a datos de otro asesor. */
export class AsesorFueraDeAlcanceError extends Error {
  constructor() {
    super('Un asesor solo puede acceder a su propia información');
    this.name = 'AsesorFueraDeAlcanceError';
  }
}
