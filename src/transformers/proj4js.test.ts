import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toLatLng, fromLatLng } from './proj4js';
import type { Proj4Options } from '../types';

const proj4Options: Proj4Options = {
  nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
  defs: {
    towgs84:
      '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
    ostn15:
      '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs'
  }
};

describe('proj4.toLatLng', () => {
  it('returns a numeric lat value', () => {
    const result = toLatLng({ ea: 337297, no: 503695 }, 7, proj4Options, 'towgs84');
    assert.ok(typeof result.lat === 'number');
  });

  it('returns a numeric lng value', () => {
    const result = toLatLng({ ea: 337297, no: 503695 }, 7, proj4Options, 'towgs84');
    assert.ok(typeof result.lng === 'number');
  });

  it('rounds to the specified number of decimal places', () => {
    const result = toLatLng({ ea: 337297, no: 503695 }, 2, proj4Options, 'towgs84');
    const decimalPlaces = result.lat.toString().split('.')[1]?.length ?? 0;
    assert.ok(decimalPlaces <= 2);
  });
});

describe('proj4.fromLatLng', () => {
  it('returns a numeric easting value', () => {
    const result = fromLatLng({ lat: 54.42481, lng: -2.9679374 }, 2, proj4Options, 'towgs84');
    assert.ok(typeof result.ea === 'number');
  });

  it('returns a numeric northing value', () => {
    const result = fromLatLng({ lat: 54.42481, lng: -2.9679374 }, 2, proj4Options, 'towgs84');
    assert.ok(typeof result.no === 'number');
  });

  it('round-trips correctly through toLatLng', () => {
    const original = { ea: 337297, no: 503695 };
    const latlng = toLatLng(original, 7, proj4Options, 'towgs84');
    const result = fromLatLng(latlng, 0, proj4Options, 'towgs84');
    assert.equal(Math.round(result.ea), original.ea);
    assert.equal(Math.round(result.no), original.no);
  });
});
