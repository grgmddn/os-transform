import type { EastingNorthing, LatLng } from '../types';

/**
 * Return transformed point geometry in GeoJSON format via Common Gateway Interface (CGI)
 * request to GIQTrans.
 * @param source - The source spatial reference identifier (SRID) number.
 * @param target - The target spatial reference identifier (SRID) number.
 * @param coordinates - The input coordinates in XY order.
 * @param cgiPath - The path to the GIQTrans CGI endpoint.
 */
async function makeRequest(
  source: number,
  target: number,
  coordinates: [number, number],
  cgiPath: string
): Promise<[number, number]> {
  const response = await fetch(cgiPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `SourceSRID=${source}&TargetSRID=${target}&Geometry={"type":"Point","coordinates":[${coordinates}]}`
  });
  const data = (await response.json()) as { coordinates: [number, number] };

  return data.coordinates;
}

/**
 * Return latlng from an input easting + northing via GIQTrans.
 * @param coordinates - The easting + northing to be transformed.
 * @param decimals - The specified number of decimal places.
 * @param cgiPath - The path to the GIQTrans CGI endpoint.
 */
export function toLatLng(
  coordinates: EastingNorthing,
  decimals: number,
  cgiPath: string
): Promise<LatLng> {
  return makeRequest(27700, 4937, [coordinates.ea, coordinates.no], cgiPath).then((data) => ({
    lat: Number(data[1].toFixed(decimals)),
    lng: Number(data[0].toFixed(decimals))
  }));
}

/**
 * Return easting + northing from an input latlng via GIQTrans.
 * @param coordinates - The latlng to be transformed.
 * @param decimals - The specified number of decimal places.
 * @param cgiPath - The path to the GIQTrans CGI endpoint.
 */
export function fromLatLng(
  coordinates: LatLng,
  decimals: number,
  cgiPath: string
): Promise<EastingNorthing> {
  return makeRequest(4937, 27700, [coordinates.lng, coordinates.lat], cgiPath).then((data) => ({
    ea: Number(data[0].toFixed(decimals)),
    no: Number(data[1].toFixed(decimals))
  }));
}
