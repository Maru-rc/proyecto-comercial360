import { describe, it, expect } from 'vitest';
import { resolveCoordinates } from './resolve-coordinates.helper.js';
import type {
  GeocodeQuery,
  GeocodeResult,
  GeocodingService,
} from '../ports/geocoding.port.js';

class MockGeocodingService implements GeocodingService {
  public lastQuery: GeocodeQuery | null = null;
  public returnResult: GeocodeResult | null = null;
  public shouldThrow = false;

  async geocode(query: GeocodeQuery): Promise<GeocodeResult | null> {
    this.lastQuery = query;
    if (this.shouldThrow) throw new Error('Network timeout');
    return this.returnResult;
  }
}

describe('resolveCoordinates', () => {
  it('usa las coordenadas existentes si ya son válidas sin llamar al servicio de geocoding', async () => {
    const geo = new MockGeocodingService();
    const result = await resolveCoordinates(geo, 10.9685, -74.7813, {
      address: 'Calle 10',
    });

    expect(result.hasValidCoordinates()).toBe(true);
    expect(result.latitude).toBe(10.9685);
    expect(result.longitude).toBe(-74.7813);
    expect(geo.lastQuery).toBeNull();
  });

  it('consulta el servicio de geocodificación si las coordenadas son nulas', async () => {
    const geo = new MockGeocodingService();
    geo.returnResult = { latitude: 11.0, longitude: -74.8 };

    const result = await resolveCoordinates(geo, null, null, {
      address: 'Cra 43 # 50-20',
      municipality: 'Barranquilla',
      department: 'Atlántico',
    });

    expect(result.latitude).toBe(11.0);
    expect(result.longitude).toBe(-74.8);
    expect(geo.lastQuery?.address).toBe('Cra 43 # 50-20');
  });

  it('hace fallback silencioso a null si el servicio falla o no encuentra resultados', async () => {
    const geo = new MockGeocodingService();
    geo.shouldThrow = true;

    const result = await resolveCoordinates(geo, null, null, {
      address: 'Calle Desconocida',
    });

    expect(result.hasValidCoordinates()).toBe(false);
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
  });
});
