import type { EastingNorthing, LatLng, BoundsResult, MaxBounds } from '../types';
import { defaultMaxBounds } from '../configs';

/**
 * Test whether coordinates are within the permitted bounds.
 * @param coordinates - The easting + northing or latlng to be validated.
 * @param maxBounds - Optional bounds override.
 */
export function checkBounds(
  coordinates: EastingNorthing | LatLng,
  maxBounds: MaxBounds = defaultMaxBounds
): BoundsResult {
  let isValid = true;

  if ('ea' in coordinates && 'no' in coordinates) {
    if (
      coordinates.ea < maxBounds.projected[0][0] ||
      coordinates.ea > maxBounds.projected[1][0] ||
      coordinates.no < maxBounds.projected[0][1] ||
      coordinates.no > maxBounds.projected[1][1]
    ) {
      isValid = false;
    }
  } else if ('lat' in coordinates && 'lng' in coordinates) {
    if (
      coordinates.lng < maxBounds.geographic[0][0] ||
      coordinates.lng > maxBounds.geographic[1][0] ||
      coordinates.lat < maxBounds.geographic[0][1] ||
      coordinates.lat > maxBounds.geographic[1][1]
    ) {
      isValid = false;
    }
  }

  const message = isValid ? '' : 'Coordinates out of range.';
  return { valid: isValid, message: message };
}
