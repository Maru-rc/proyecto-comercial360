export class Coordinates {
  private readonly _latitude: number | null;
  private readonly _longitude: number | null;

  constructor(latitude: number | null, longitude: number | null) {
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      throw new Error('La longitud debe estar entre -180 y 180');
    }
    this._latitude = latitude;
    this._longitude = longitude;
  }

  get latitude(): number | null {
    return this._latitude;
  }

  get longitude(): number | null {
    return this._longitude;
  }

  hasValidCoordinates(): boolean {
    return this._latitude !== null && this._longitude !== null;
  }
}
