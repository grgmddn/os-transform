import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';
import { Transform } from './transform';
import type { TransformOptions } from './types';

const CGI_PATH = 'http://localhost/cgi-bin/giqtrans';

/**
 * MockAgent replaces Node's real HTTP dispatcher via setGlobalDispatcher(),
 * causing any fetch() call in the process — including inside giqtrans.ts —
 * to be intercepted rather than hitting the network.
 *
 * disableNetConnect() ensures unmatched requests throw immediately rather
 * than attempting a real connection.
 */
const mockAgent = new MockAgent();

before(() => {
  setGlobalDispatcher(mockAgent);
  mockAgent.disableNetConnect();
});

/**
 * Full options reset before every test. This prevents mutations made in one
 * test (e.g. changing Transform.options.type) from affecting subsequent tests.
 */
const defaultOptions: Required<TransformOptions> = {
  type: 'ostn15-cgi',
  gsbPath: 'resources/OSTN15_NTv2_OSGBtoETRS.gsb',
  tifPath: 'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif',
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
    defs: {
      towgs84:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
      ostn15:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs'
    }
  },
  cgiPath: CGI_PATH,
  maxBounds: {
    projected: [
      [0.0, 0.0],
      [699999.9, 1299999.9]
    ],
    geographic: [
      [-8.74, 49.84],
      [1.96, 60.9]
    ]
  }
};

beforeEach(() => {
  Transform.options = { ...defaultOptions };
});

/* Close the mock agent and restore the real dispatcher after all tests have run. */
after(async () => {
  await mockAgent.close();
  setGlobalDispatcher(new Agent());
});

describe('Transform.toLatLng', () => {
  it('returns an empty object for out-of-bounds coordinates', async () => {
    const result = await Transform.toLatLng({ ea: -1, no: 503695 });
    assert.deepEqual(result, {});
  });

  it('returns a LatLng via GIQTrans for valid coordinates', async () => {
    /* Register the intercept before calling Transform.toLatLng(). */
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [-2.9679374, 54.42481] });

    /**
     * When giqtrans.toLatLng() calls fetch() internally, the mock agent catches
     * the request and returns this response without hitting the network.
     */
    const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
    assert.ok('lat' in result);
    assert.ok('lng' in result);
  });

  it('returns a LatLng via Proj4js when type is simple-towgs84', () => {
    Transform.options.type = 'simple-towgs84';
    const result = Transform.toLatLng({ ea: 337297, no: 503695 });
    assert.ok('lat' in (result as object));
    assert.ok('lng' in (result as object));
  });
});

describe('Transform.fromLatLng', () => {
  it('returns an empty object for out-of-bounds coordinates', async () => {
    const result = await Transform.fromLatLng({ lat: 61, lng: -2.96794 });
    assert.deepEqual(result, {});
  });

  it('returns an EastingNorthing via GIQTrans for valid coordinates', async () => {
    /* Register the intercept before calling Transform.toLatLng(). */
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [337297, 503695] });

    /**
     * When giqtrans.toLatLng() calls fetch() internally, the mock agent catches
     * the request and returns this response without hitting the network.
     */
    const result = await Transform.fromLatLng({ lat: 54.42481, lng: -2.9679374 });
    assert.ok('ea' in result);
    assert.ok('no' in result);
  });

  it('returns an EastingNorthing via Proj4js when type is simple-towgs84', () => {
    Transform.options.type = 'simple-towgs84';
    const result = Transform.fromLatLng({ lat: 54.42481, lng: -2.9679374 });
    assert.ok('ea' in (result as object));
    assert.ok('no' in (result as object));
  });
});

describe('Transform.toGridRef', () => {
  it('returns a GridRef for valid coordinates', () => {
    const result = Transform.toGridRef({ ea: 337297, no: 503695 });
    assert.ok('text' in result);
    assert.ok('letters' in result);
    assert.ok('eastings' in result);
    assert.ok('northings' in result);
  });

  it('returns an empty object for out-of-bounds coordinates', () => {
    const result = Transform.toGridRef({ ea: -1, no: 503695 });
    assert.deepEqual(result, {});
  });
});

describe('Transform.fromGridRef', () => {
  it('returns an EastingNorthing for a valid grid reference', () => {
    const result = Transform.fromGridRef('NY 37297 03695');
    assert.ok('ea' in result);
    assert.ok('no' in result);
  });

  it('returns an empty object for an invalid grid reference', () => {
    const result = Transform.fromGridRef('INVALID');
    assert.deepEqual(result, {});
  });
});
