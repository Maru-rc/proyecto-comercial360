export class Coordinates {
  public readonly latitude: number | null;
  public readonly longitude: number | null;

  constructor(latitude: number | null, longitude: number | null) {
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      throw new Error('La longitud debe estar entre -180 y 180');
    }
    this.latitude = latitude;
    this.longitude = longitude;
  }

  hasValidCoordinates(): boolean {
    return this.latitude !== null && this.longitude !== null;
  }
}
