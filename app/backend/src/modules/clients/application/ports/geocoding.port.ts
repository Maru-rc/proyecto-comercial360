export interface GeocodeQuery {
  address: string;
  municipality?: string | null;
  department?: string | null;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export interface GeocodingService {
  geocode(query: GeocodeQuery): Promise<GeocodeResult | null>;
}

export const GEOCODING_SERVICE = Symbol('GEOCODING_SERVICE');
