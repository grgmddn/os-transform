import proj4 from 'proj4';

import type { TransformOptions } from '../types';

type GsbOptions = Extract<TransformOptions, { mode: 'ostn15-gsb' }>;

export async function fetchGsb(gsbPath: string): Promise<ArrayBuffer> {
  const response = await fetch(gsbPath);
  return response.arrayBuffer();
}

export function registerGsbDefs(ostn15Def: string): void {
  proj4.defs('EPSG:27700', ostn15Def);
}

export async function registerGsb(options: GsbOptions): Promise<void> {
  const arrayBuffer = await fetchGsb(options.gsbPath);

  registerGsbDefs(options.proj4.defs.ostn15);

  proj4.nadgrid(options.proj4.nadgrid, arrayBuffer);
}
