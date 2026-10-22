// Domain errors for authorization. The presentation layer converts these
// into 403 Forbidden responses (see DomainErrorsFilter).

/** An ASESOR user who has no matching record in the ASESOR table. */
export class AsesorNoVinculadoError extends Error {
  constructor(email: string) {
    super(`No asesor record is linked to email ${email}`);
    this.name = 'AsesorNoVinculadoError';
  }
}

/** An asesor attempted to access another asesor's data. */
export class AsesorFueraDeAlcanceError extends Error {
  constructor() {
    super('An asesor can only access their own information');
    this.name = 'AsesorFueraDeAlcanceError';
  }
}
