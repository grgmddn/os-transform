export interface BoundsResult {
  valid: boolean;
  message: string;
}

export interface EastingNorthing {
  ea: number;
  no: number;
}

export interface GridRef {
  text: string;
  html: string;
  letters: string;
  eastings: string;
  northings: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MaxBounds {
  projected: [[number, number], [number, number]];
  geographic: [[number, number], [number, number]];
}

export interface Proj4Options {
  nadgrid: string;
  defs: {
    towgs84: string;
    ostn15: string;
  };
}

export interface TransformOptions {
  /**
   * Transformation type:
   * # ostn15-cgi - [default] OSTN15 Transformation via Common Gateway Interface (CGI) request to GIQTrans.
   * # ostn15-gsb - OSTN15 Transformation using Grid Based Datum Adjustments (NTv2 `.gsb` file). Uses proj4js.
   * # ostn15-tif - OSTN15 Transformation using Grid Based Datum Adjustments (GeoTIFF `.tif` file). Uses proj4js.
   * # simple-towgs84 - Simple seven-parameter geodetic transformation. Uses proj4js.
   */
  type?: 'ostn15-cgi' | 'ostn15-gsb' | 'ostn15-tif' | 'simple-towgs84';
  gsbPath?: string;
  tifPath?: string;
  proj4?: Proj4Options;
  cgiPath?: string;
  maxBounds?: MaxBounds;
}
