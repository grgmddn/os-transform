import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';
import * as geotiff from 'geotiff';
import proj4 from 'proj4';

import { fetchTif, registerTifDefs, registerTif } from './proj4js.tif';
import type { TransformOptions } from '../types';

const ostn15Def =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs';

const tifOptions: Extract<TransformOptions, { mode: 'ostn15-tif' }> = {
  mode: 'ostn15-tif',
  tifPath: 'http://localhost/OSTN15_NTv2_OSGBtoETRS.tif',
  geotiff,
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
    defs: { ostn15: ostn15Def }
  }
};

describe('registerTifDefs', () => {
  it('registers the correct EPSG:27700 definition', () => {
    registerTifDefs(ostn15Def);
    const registered = proj4.defs('EPSG:27700');
    assert.ok(registered, 'EPSG:27700 should be registered');
    assert.equal(registered.projName, 'tmerc');
    assert.equal(registered.ellps, 'airy');
    assert.equal(registered.nadgrids, 'OSTN15_NTv2_OSGBtoETRS');
  });
});

describe('fetchTif', () => {
  const mockAgent = new MockAgent();

  before(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();

    mockAgent
      .get('http://localhost')
      .intercept({ path: '/OSTN15_NTv2_OSGBtoETRS.tif', method: 'GET' })
      .reply(200, new ArrayBuffer(8), {
        headers: { 'content-type': 'application/octet-stream' }
      });
  });

  after(async () => {
    await mockAgent.close();
    setGlobalDispatcher(new Agent());
  });

  it('returns an ArrayBuffer', async () => {
    const result = await fetchTif(tifOptions.tifPath);
    assert.ok(result instanceof ArrayBuffer);
  });
});

describe('registerTif', () => {
  it('throws a clear error if geotiff is not provided', async () => {
    await assert.rejects(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => registerTif({ ...tifOptions, geotiff: undefined as any }),
      /options.geotiff is required for ostn15-tif mode/
    );
  });
});
