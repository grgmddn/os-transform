import type { EastingNorthing, LatLng, TransformOptions } from '../types';

import { defaultTowgs84Def } from '../configs';
import { registerGsb as registerGsbMode } from './proj4js.gsb';
import { registerTif as registerTifMode } from './proj4js.tif';

/**
 * proj4 is an optional peer dependency. We import it directly here so that
 * the module works correctly in both Node.js and browser environments when
 * proj4 is installed. If proj4 is not installed, this import will throw a
 * module-not-found error at runtime
 */
import proj4 from 'proj4';

/**
 * Register the EPSG:27700 projection definition with proj4 and perform any
 * mode-specific setup (e.g. loading a .gsb or .tif file).
 * Called once from Transform.configure() when a proj4-based mode is selected.
 *
 * @param options - The TransformOptions resolved from Transform.configure().
 */
export async function register(options: TransformOptions): Promise<void> {
  switch (options.mode) {
    case 'ostn15-gsb':
      await registerGsbMode(options);
      break;

    case 'ostn15-tif':
      await registerTifMode(options);
      break;

    case 'simple-towgs84':
      proj4.defs('EPSG:27700', options.proj4?.defs.towgs84 ?? defaultTowgs84Def);
      break;
  }
}

/**
 * Return latlng from an input easting + northing via Proj4js.
 *
 * @param coordinates - The easting and northing coordinates to convert, expressed in metres relative to the coordinate reference system defined by `defKey`.
 * @param decimals - The number of decimal places to which the resulting latitude and longitude values will be rounded.
 * @param proj4Options - Configuration object containing projection definition strings keyed by their identifier, used to register the source CRS with Proj4js.
 * @param defKey - The key within `proj4Options.defs` that identifies the projection definition string to use for the conversion (e.g. `'EPSG:27700'`).
 * @returns A `LatLng` object containing the converted latitude and longitude, rounded to the specified number of decimal places.
 */
export function toLatLng(coordinates: EastingNorthing, decimals: number): LatLng {
  const point = proj4('EPSG:27700', 'EPSG:4326', [coordinates.ea, coordinates.no]);
  return {
    lat: Number(point[1].toFixed(decimals)),
    lng: Number(point[0].toFixed(decimals))
  };
}

/**
 * Return easting + northing from an input latlng via Proj4js.
 *
 * @param coordinates - The latitude and longitude coordinates to convert, expressed in decimal degrees in the WGS84 (EPSG:4326) coordinate reference system.
 * @param decimals - The number of decimal places to which the resulting easting and northing values will be rounded.
 * @param proj4Options - Configuration object containing projection definition strings keyed by their identifier, used to register the target CRS with Proj4js.
 * @param defKey - The key within `proj4Options.defs` that identifies the projection definition string to use for the conversion (e.g. `'EPSG:27700'`).
 * @returns An `EastingNorthing` object containing the converted easting and northing values in metres, rounded to the specified number of decimal places.
 */
export function fromLatLng(coordinates: LatLng, decimals: number): EastingNorthing {
  const point = proj4('EPSG:4326', 'EPSG:27700', [coordinates.lng, coordinates.lat]);
  return {
    ea: Number(point[0].toFixed(decimals)),
    no: Number(point[1].toFixed(decimals))
  };
}
