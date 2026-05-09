import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkBounds } from './check-bounds';

describe('checkBounds', () => {
  describe('projected (easting/northing)', () => {
    it('returns valid for coordinates within bounds', () => {
      const result = checkBounds({ ea: 212355, no: 826197 });
      assert.equal(result.valid, true);
      assert.equal(result.message, '');
    });

    it('returns invalid for easting below minimum', () => {
      const result = checkBounds({ ea: -1, no: 826197 });
      assert.equal(result.valid, false);
      assert.equal(result.message, 'Coordinates out of range.');
    });

    it('returns invalid for easting above maximum', () => {
      const result = checkBounds({ ea: 700000, no: 826197 });
      assert.equal(result.valid, false);
      assert.equal(result.message, 'Coordinates out of range.');
    });

    it('returns invalid for northing below minimum', () => {
      const result = checkBounds({ ea: 212355, no: -1 });
      assert.equal(result.valid, false);
      assert.equal(result.message, 'Coordinates out of range.');
    });

    it('returns invalid for northing above maximum', () => {
      const result = checkBounds({ ea: 212355, no: 1300000 });
      assert.equal(result.valid, false);
      assert.equal(result.message, 'Coordinates out of range.');
    });
  });

  describe('geographic (lat/lng)', () => {
    it('returns valid for coordinates within bounds', () => {
      const result = checkBounds({ lat: 57.287722, lng: -5.1151664 });
      assert.equal(result.valid, true);
      assert.equal(result.message, '');
    });

    it('returns invalid for lng below minimum', () => {
      const result = checkBounds({ lat: 57.287722, lng: -9 });
      assert.equal(result.valid, false);
      assert.equal(result.message, 'Coordinates out of range.');
    });

    it('returns invalid for lat above maximum', () => {
      const result = checkBounds({ lat: 61, lng: -5.1151664 });
      assert.equal(result.valid, false);
      assert.equal(result.message, 'Coordinates out of range.');
    });
  });
});
