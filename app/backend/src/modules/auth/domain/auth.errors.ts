export class AsesorNoVinculadoError extends Error {
  constructor(email: string) {
    super(`No asesor record is linked to email ${email}`);
    this.name = 'AsesorNoVinculadoError';
  }
}

export class AsesorFueraDeAlcanceError extends Error {
  constructor() {
    super('An asesor can only access their own information');
    this.name = 'AsesorFueraDeAlcanceError';
  }
}
