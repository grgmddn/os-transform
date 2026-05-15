import type { EastingNorthing, LatLng, GridRef, TransformOptions } from './types';
import { defaultMaxBounds } from './configs';
import { checkBounds } from './utils/check-bounds';
import { toGridRef, fromGridRef } from './utils/grid-ref';
import * as giqtrans from './transformers/giqtrans';
import * as proj4Transformer from './transformers/proj4js';

export const Transform = {
  options: null as TransformOptions | null,

  /**
   * Configure the Transform module. Call this once at application startup
   * before invoking any transformation methods.
   * Registers proj4 definitions and performs any mode-specific setup.
   *
   * @param opts - The transformation options to apply.
   */
  async configure(opts: TransformOptions): Promise<void> {
    this.options = {
      maxBounds: defaultMaxBounds,
      ...opts
    };

    if (this.options.mode !== 'ostn15-cgi') {
      await proj4Transformer.register(this.options);
    }
  },

  /**
   * Return latlng from an input easting + northing.
   * @param coordinates - The easting + northing to be transformed.
   * @param decimals - [optional] The specified number of decimal places.
   */
  toLatLng(
    coordinates: EastingNorthing,
    decimals = 7
  ): Promise<LatLng> | LatLng | Record<string, never> {
    if (!this.options) {
      throw new Error('[Transform] Transform.configure() must be called before use.');
    }

    const test = checkBounds(coordinates, this.options.maxBounds);
    if (!test.valid) {
      console.log(test.message);
      return {};
    }

    if (this.options.mode === 'ostn15-cgi') {
      return giqtrans.toLatLng(coordinates, decimals, this.options.cgiPath);
    } else {
      return proj4Transformer.toLatLng(coordinates, decimals);
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
    if (!this.options) {
      throw new Error('[Transform] Transform.configure() must be called before use.');
    }

    const test = checkBounds(coordinates, this.options.maxBounds);
    if (!test.valid) {
      console.log(test.message);
      return {};
    }

    if (this.options.mode === 'ostn15-cgi') {
      /* Makes a CGI/HTTP request to the GIQTrans service. */
      return giqtrans.fromLatLng(coordinates, decimals, this.options.cgiPath);
    } else {
      /**
       * Fallback to proj4-based transformation
       * Applies to: ostn15-gsb, ostn15-tif, AND simple-towgs84
       */
      return proj4Transformer.fromLatLng(coordinates, decimals);
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
