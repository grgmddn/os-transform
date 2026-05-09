import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateGridRef, toGridRef, fromGridRef } from './grid-ref';

describe('validateGridRef', () => {
  it('returns valid for a 10-figure grid reference formatted with spaces', () => {
    const result = validateGridRef('NH 12355 26197');
    assert.equal(result.valid, true);
    assert.equal(result.message, '');
  });

  it('is case-insensitive', () => {
    const result = validateGridRef('nh 12355 26197');
    assert.equal(result.valid, true);
  });

  it('returns valid for a 4-figure grid square without spaces', () => {
    const result = validateGridRef('NH1226');
    assert.equal(result.valid, true);
  });

  it('returns valid for an 8-figure grid reference without spaces', () => {
    const result = validateGridRef('NH12352619');
    assert.equal(result.valid, true);
  });

  it('returns valid for a 10-figure grid reference without spaces', () => {
    const result = validateGridRef('NH1235526197');
    assert.equal(result.valid, true);
  });

  it('returns invalid for a grid reference with mismatched digit pairs', () => {
    const result = validateGridRef('NH 1235 261');
    assert.equal(result.valid, false);
    assert.equal(result.message, 'Invalid grid reference.');
  });

  it('returns invalid for an incorrect letter prefix', () => {
    const result = validateGridRef('XX 12345 67890');
    assert.equal(result.valid, false);
    assert.equal(result.message, 'Invalid grid reference.');
  });

  it('returns invalid for a completely invalid string', () => {
    const result = validateGridRef('INVALID');
    assert.equal(result.valid, false);
    assert.equal(result.message, 'Invalid grid reference.');
  });

  it('returns invalid for an empty string', () => {
    const result = validateGridRef('');
    assert.equal(result.valid, false);
    assert.equal(result.message, 'Invalid grid reference.');
  });
});

describe('toGridRef', () => {
  it('returns the correct grid reference text for a known easting/northing', () => {
    const result = toGridRef({ ea: 212355, no: 826197 });
    assert.equal((result as { text: string }).text, 'NH 12355 26197');
  });

  it('returns the correct grid reference letter prefix', () => {
    const result = toGridRef({ ea: 212355, no: 826197 });
    assert.equal((result as { letters: string }).letters, 'NH');
  });

  it('returns the correct northings padding to 5 digits', () => {
    const result = toGridRef({ ea: 212355, no: 826197 });
    assert.equal((result as { eastings: string }).eastings, '12355');
  });

  it('returns the correct northings padding to 5 digits', () => {
    const result = toGridRef({ ea: 212355, no: 826197 });
    assert.equal((result as { northings: string }).northings, '26197');
  });

  it('formats text output with spaces', () => {
    const result = toGridRef({ ea: 212355, no: 826197 });
    assert.equal(result.text, 'NH 12355 26197');
  });

  it('formats html output with thinsp entities', () => {
    const result = toGridRef({ ea: 212355, no: 826197 });
    assert.equal(result.html, 'NH&thinsp;12355&thinsp;26197');
  });

  it('returns an empty object for out-of-bounds coordinates', () => {
    const result = toGridRef({ ea: -1, no: 826197 });
    assert.deepEqual(result, {});
  });

  it('returns an empty object for malformed coordinates', () => {
    const result = toGridRef({ ea: 99999999, no: 99999999999999 });
    assert.deepEqual(result, {});
  });
});

describe('fromGridRef', () => {
  it('returns the correct easting for a known grid reference', () => {
    const result = fromGridRef('NH 12355 26197');
    assert.equal((result as { ea: number }).ea, 212355);
  });

  it('returns the correct northing for a known grid reference', () => {
    const result = fromGridRef('NH 12355 26197');
    assert.equal((result as { no: number }).no, 826197);
  });

  it('handles a 6-figure grid reference', () => {
    const result = fromGridRef('NH 123 261');
    assert.equal(result.ea, 212300);
    assert.equal(result.no, 826100);
  });

  it('handles a 10-figure grid reference without spaces', () => {
    const result = fromGridRef('NH1235526197');
    assert.equal((result as { ea: number }).ea, 212355);
    assert.equal((result as { no: number }).no, 826197);
  });

  it('returns an empty object for an invalid grid reference', () => {
    const result = fromGridRef('INVALID');
    assert.deepEqual(result, {});
  });

  it('returns an empty object for an empty string', () => {
    const result = fromGridRef('');
    assert.deepEqual(result, {});
  });

  it('round-trips correctly through toGridRef', () => {
    const original = { ea: 212355, no: 826197 };
    const ref = toGridRef(original) as { text: string };
    const result = fromGridRef(ref.text) as { ea: number; no: number };
    assert.equal(result.ea, original.ea);
    assert.equal(result.no, original.no);
  });
});
