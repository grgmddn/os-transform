import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import proj4 from 'proj4';

import { register, toLatLng, fromLatLng } from './proj4js';
import type { TransformOptions } from '../types';

const towgs84Def =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs';

const towgs84Options: TransformOptions = {
  mode: 'simple-towgs84',
  proj4: { defs: { towgs84: towgs84Def } }
};

const towgs84DefaultOptions: TransformOptions = {
  mode: 'simple-towgs84'
};

describe('proj4.register — simple-towgs84', () => {
  it('registers the correct EPSG:27700 definition with an explicit def string', async () => {
    await register(towgs84Options);
    const registered = proj4.defs('EPSG:27700');
    assert.ok(registered, 'EPSG:27700 should be registered');
    assert.equal(registered.projName, 'tmerc');
    assert.equal(registered.ellps, 'airy');
    assert.ok(Array.isArray(registered.datum_params), 'datum_params (towgs84) should be present');
  });

  it('registers the correct EPSG:27700 definition using the default def string', async () => {
    await register(towgs84DefaultOptions);
    const registered = proj4.defs('EPSG:27700');
    assert.ok(registered, 'EPSG:27700 should be registered');
    assert.equal(registered.projName, 'tmerc');
    assert.equal(registered.ellps, 'airy');
    assert.ok(Array.isArray(registered.datum_params), 'datum_params (towgs84) should be present');
  });
});

describe('proj4.toLatLng — simple-towgs84', () => {
  before(async () => {
    await register(towgs84Options);
  });

  it('returns a numeric lat value', () => {
    const result = toLatLng({ ea: 337297, no: 503695 }, 7);
    assert.ok(typeof result.lat === 'number');
  });

  it('returns a numeric lng value', () => {
    const result = toLatLng({ ea: 337297, no: 503695 }, 7);
    assert.ok(typeof result.lng === 'number');
  });

  it('rounds to the specified number of decimal places', () => {
    const result = toLatLng({ ea: 337297, no: 503695 }, 2);
    const decimalPlaces = result.lat.toString().split('.')[1]?.length ?? 0;
    assert.ok(decimalPlaces <= 2);
  });
});

describe('proj4.fromLatLng — simple-towgs84', () => {
  before(async () => {
    await register(towgs84Options);
  });

  it('returns a numeric easting value', () => {
    const result = fromLatLng({ lat: 54.42481, lng: -2.9679374 }, 2);
    assert.ok(typeof result.ea === 'number');
  });

  it('returns a numeric northing value', () => {
    const result = fromLatLng({ lat: 54.42481, lng: -2.9679374 }, 2);
    assert.ok(typeof result.no === 'number');
  });

  it('round-trips correctly through toLatLng', () => {
    const original = { ea: 337297, no: 503695 };
    const latlng = toLatLng(original, 7);
    const result = fromLatLng(latlng, 0);
    assert.equal(Math.round(result.ea), original.ea);
    assert.equal(Math.round(result.no), original.no);
  });
});
