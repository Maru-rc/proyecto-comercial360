import { Coordinates } from '../../domain/value-objects/coordinates.vo.js';
import type { GeocodingService } from '../ports/geocoding.port.js';

export interface AddressDetails {
  address?: string | null;
  municipality?: string | null;
  department?: string | null;
}

/**
 * Resuelve coordenadas con fallback tolerante a fallos contra el servicio de mapas (N-2)
 */
export async function resolveCoordinates(
  geocodingService: GeocodingService,
  latitude?: number | null,
  longitude?: number | null,
  addressDetails?: AddressDetails,
): Promise<Coordinates> {
  const coordinates = new Coordinates(latitude ?? null, longitude ?? null);
  if (coordinates.hasValidCoordinates()) {
    return coordinates;
  }

  if (!addressDetails?.address) {
    return new Coordinates(null, null);
  }

  try {
    const geoResult = await geocodingService.geocode({
      address: addressDetails.address,
      municipality: addressDetails.municipality ?? undefined,
      department: addressDetails.department ?? undefined,
    });

    if (geoResult) {
      return new Coordinates(geoResult.latitude, geoResult.longitude);
    }
  } catch {
    // Si falla el geocodificador externo (timeout o error de red), fallback a null
  }

  return new Coordinates(null, null);
}
