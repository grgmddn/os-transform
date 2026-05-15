import type { MaxBounds } from '../types';

/** Default geographic and projected bounds for Great Britain. */
export const defaultMaxBounds: MaxBounds = {
  projected: [
    [0.0, 0.0],
    [699999.9, 1299999.9]
  ],
  geographic: [
    [-8.74, 49.84],
    [1.96, 60.9]
  ]
};

/**
 * Default proj4 definition string for the simple Helmert (towgs84) transformation.
 * Represents the seven-parameter OSGB36 to WGS84 transformation.
 * Used as a fallback when no proj4 options are supplied in 'simple-towgs84' mode.
 */
export const defaultTowgs84Def =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs';
