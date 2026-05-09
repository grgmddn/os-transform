import type { EastingNorthing, LatLng, GridRef, TransformOptions } from './types';
import { defaultOptions } from './configs';
import { checkBounds } from './utils/check-bounds';
import { toGridRef, fromGridRef } from './utils/grid-ref';
import * as giqtrans from './transformers/giqtrans';
import * as proj4Transformer from './transformers/proj4js';

export const Transform = {
  options: { ...defaultOptions } as Required<TransformOptions>,

  /**
   * Return latlng from an input easting + northing.
   * @param coordinates - The easting + northing to be transformed.
   * @param decimals - [optional] The specified number of decimal places.
   */
  toLatLng(
    coordinates: EastingNorthing,
    decimals = 7
  ): Promise<LatLng> | LatLng | Record<string, never> {
    const test = checkBounds(coordinates, this.options.maxBounds);
    if (!test.valid) {
      console.log(test.message);
      return {};
    }

    if (this.options.type === 'ostn15-cgi') {
      return giqtrans.toLatLng(coordinates, decimals, this.options.cgiPath);
    } else {
      const defKey = this.options.type === 'simple-towgs84' ? 'towgs84' : 'ostn15';
      return proj4Transformer.toLatLng(coordinates, decimals, this.options.proj4, defKey);
    }
  },

  /**
   * Return easting + northing from an input latlng.
   * @param coordinates - The latlng to be transformed.
   * @param decimals - [optional] The specified number of decimal places.
   */
  fromLatLng(
    coordinates: LatLng,
    decimals = 2
  ): Promise<EastingNorthing> | EastingNorthing | Record<string, never> {
    const test = checkBounds(coordinates, this.options.maxBounds);
    if (!test.valid) {
      console.log(test.message);
      return {};
    }

    if (this.options.type === 'ostn15-cgi') {
      /* Makes a CGI/HTTP request to the GIQTrans service. */
      return giqtrans.fromLatLng(coordinates, decimals, this.options.cgiPath);
    } else {
      /**
       * Fallback to proj4-based transformation
       * Applies to: ostn15-gsb, ostn15-tif, AND simple-towgs84
       */
      const defKey = this.options.type === 'simple-towgs84' ? 'towgs84' : 'ostn15';
      return proj4Transformer.fromLatLng(coordinates, decimals, this.options.proj4, defKey);
    }
  },

  /**
   * Return grid reference [plain | encoded | components] from an input easting + northing.
   * @param coordinates - The easting + northing to be converted.
   */
  toGridRef(coordinates: EastingNorthing): GridRef | Record<string, never> {
    return toGridRef(coordinates);
  },

  /**
   * Return easting + northing from an input grid reference.
   * @param gridref - The grid reference to be converted.
   */
  fromGridRef(gridref: string): EastingNorthing | Record<string, never> {
    return fromGridRef(gridref);
  }
};
