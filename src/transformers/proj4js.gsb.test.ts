import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';
import proj4 from 'proj4';

import { fetchGsb, registerGsbDefs } from './proj4js.gsb';
import type { TransformOptions } from '../types';

const ostn15Def =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs';

const gsbOptions: Extract<TransformOptions, { mode: 'ostn15-gsb' }> = {
  mode: 'ostn15-gsb',
  gsbPath: 'http://localhost/OSTN15_NTv2_OSGBtoETRS.gsb',
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
    defs: { ostn15: ostn15Def }
  }
};

describe('registerGsbDefs', () => {
  it('registers the correct EPSG:27700 definition', () => {
    registerGsbDefs(ostn15Def);
    const registered = proj4.defs('EPSG:27700');
    assert.ok(registered, 'EPSG:27700 should be registered');
    assert.equal(registered.projName, 'tmerc');
    assert.equal(registered.ellps, 'airy');
    assert.equal(registered.nadgrids, 'OSTN15_NTv2_OSGBtoETRS');
  });
});

describe('fetchGsb', () => {
  const mockAgent = new MockAgent();

  before(() => {
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();

    mockAgent
      .get('http://localhost')
      .intercept({ path: '/OSTN15_NTv2_OSGBtoETRS.gsb', method: 'GET' })
      .reply(200, new ArrayBuffer(8), {
        headers: { 'content-type': 'application/octet-stream' }
      });
  });

  after(async () => {
    await mockAgent.close();
    setGlobalDispatcher(new Agent());
  });

  it('returns an ArrayBuffer', async () => {
    const result = await fetchGsb(gsbOptions.gsbPath);
    assert.ok(result instanceof ArrayBuffer);
  });
});
