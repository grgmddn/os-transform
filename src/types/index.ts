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

interface Proj4OptionsOstn15 {
  nadgrid: string;
  defs: {
    ostn15: string;
  };
}

interface Proj4OptionsToWgs84 {
  defs: {
    towgs84: string;
  };
}

interface TransformOptionsBase {
  maxBounds?: MaxBounds;
}

interface TransformOptionsCgi extends TransformOptionsBase {
  mode: 'ostn15-cgi';
  cgiPath: string;
}

interface TransformOptionsGsb extends TransformOptionsBase {
  mode: 'ostn15-gsb';
  gsbPath: string;
  proj4: Proj4OptionsOstn15;
}

interface TransformOptionsTif extends TransformOptionsBase {
  mode: 'ostn15-tif';
  geotiff: typeof import('geotiff');
  tifPath: string;
  proj4: Proj4OptionsOstn15;
}

interface TransformOptionsToWgs84 extends TransformOptionsBase {
  mode: 'simple-towgs84';
  proj4?: Proj4OptionsToWgs84;
}

export type TransformOptions =
  | TransformOptionsCgi
  | TransformOptionsGsb
  | TransformOptionsTif
  | TransformOptionsToWgs84;

/** Union of proj4-based transformation modes. */
export type Proj4Mode = Exclude<TransformOptions['mode'], 'ostn15-cgi'>;
