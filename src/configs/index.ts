import type { TransformOptions } from '../types';

export const defaultOptions: Required<TransformOptions> = {
  cgiPath: '/cgi-bin/giqtrans',
  gsbPath: 'resources/OSTN15_NTv2_OSGBtoETRS.gsb',
  maxBounds: {
    projected: [
      [0.0, 0.0],
      [699999.9, 1299999.9]
    ],
    geographic: [
      [-8.74, 49.84],
      [1.96, 60.9]
    ]
  },
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
    defs: {
      towgs84:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
      ostn15:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs'
    }
  },
  tifPath: 'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif',
  type: 'ostn15-cgi'
};
