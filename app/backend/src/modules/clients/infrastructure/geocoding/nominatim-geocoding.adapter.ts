import { Injectable, Logger } from '@nestjs/common';
import {
  GeocodeQuery,
  GeocodeResult,
  GeocodingService,
} from '../../application/ports/geocoding.port.js';

@Injectable()
export class NominatimGeocodingAdapter implements GeocodingService {
  private readonly logger = new Logger(NominatimGeocodingAdapter.name);
  private readonly cache = new Map<string, GeocodeResult | null>();

  async geocode(query: GeocodeQuery): Promise<GeocodeResult | null> {
    const parts = [query.address, query.municipality, query.department]
      .filter(Boolean)
      .map((p) => p?.trim())
      .join(', ');

    if (!parts) return null;

    const cacheKey = parts.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) ?? null;
    }

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', parts);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Comercial360-App/1.0',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(
          `Nominatim respondió con status ${response.status} para: ${parts}`,
        );
        this.cache.set(cacheKey, null);
        return null;
      }

      const data = (await response.json()) as Array<{
        lat: string;
        lon: string;
      }>;
      if (Array.isArray(data) && data.length > 0) {
        const result: GeocodeResult = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
        this.cache.set(cacheKey, result);
        return result;
      }

      this.cache.set(cacheKey, null);
      return null;
    } catch (error) {
      this.logger.warn(
        `Error al consultar Nominatim para "${parts}": ${(error as Error).message}`,
      );
      return null;
    }
  }
}
