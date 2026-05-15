import proj4 from 'proj4';

import type { TransformOptions } from '../types';

type TifOptions = Extract<TransformOptions, { mode: 'ostn15-tif' }>;

export async function fetchTif(tifPath: string): Promise<ArrayBuffer> {
  const response = await fetch(tifPath);
  return response.arrayBuffer();
}

export async function parseTif(
  arrayBuffer: ArrayBuffer,
  geotiff: typeof import('geotiff')
): Promise<Awaited<ReturnType<typeof import('geotiff').fromArrayBuffer>>> {
  return geotiff.fromArrayBuffer(arrayBuffer);
}

export function registerTifDefs(ostn15Def: string): void {
  proj4.defs('EPSG:27700', ostn15Def);
}

export async function registerTif(options: TifOptions): Promise<void> {
  if (!options.geotiff?.fromArrayBuffer) {
    throw new Error(
      '[Transform] options.geotiff is required for ostn15-tif mode. ' +
        "Install geotiff and pass the module in: import * as geotiff from 'geotiff'"
    );
  }

  const arrayBuffer = await fetchTif(options.tifPath);
  const tiff = await parseTif(arrayBuffer, options.geotiff);

  registerTifDefs(options.proj4.defs.ostn15);

  // eslint-disable-next-line
  await (proj4 as any).nadgrid(options.proj4.nadgrid, tiff).ready;
}
