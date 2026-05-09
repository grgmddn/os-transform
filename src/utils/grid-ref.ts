import type { EastingNorthing, GridRef, BoundsResult } from '../types';
import { checkBounds } from './check-bounds';

/**
 * Test whether a standard grid reference with a valid format has been provided.
 * @param gridref - The grid reference to be validated.
 */
export function validateGridRef(gridref: string): BoundsResult {
  const regex = /^[THJONS][VWXYZQRSTULMNOPFGHJKABCDE] ?[0-9]{1,5} ?[0-9]{1,5}$/;
  const match = Array.isArray(gridref.toUpperCase().match(regex)) ? true : false;

  const isValid = gridref.replace(/ /g, '').length % 2 === 0 && match ? true : false;
  const message = isValid ? '' : 'Invalid grid reference.';

  return { valid: isValid, message: message };
}

/**
 * Return grid reference [plain | encoded | components] from an input easting + northing.
 * @param coordinates - The easting + northing to be converted.
 */
export function toGridRef(coordinates: EastingNorthing): GridRef | Record<string, never> {
  const test = checkBounds(coordinates);
  if (!test.valid) {
    console.log(test.message);
    return {};
  }

  const prefixes = [
    ['SV', 'SW', 'SX', 'SY', 'SZ', 'TV', 'TW'],
    ['SQ', 'SR', 'SS', 'ST', 'SU', 'TQ', 'TR'],
    ['SL', 'SM', 'SN', 'SO', 'SP', 'TL', 'TM'],
    ['SF', 'SG', 'SH', 'SJ', 'SK', 'TF', 'TG'],
    ['SA', 'SB', 'SC', 'SD', 'SE', 'TA', 'TB'],
    ['NV', 'NW', 'NX', 'NY', 'NZ', 'OV', 'OW'],
    ['NQ', 'NR', 'NS', 'NT', 'NU', 'OQ', 'OR'],
    ['NL', 'NM', 'NN', 'NO', 'NP', 'OL', 'OM'],
    ['NF', 'NG', 'NH', 'NJ', 'NK', 'OF', 'OG'],
    ['NA', 'NB', 'NC', 'ND', 'NE', 'OA', 'OB'],
    ['HV', 'HW', 'HX', 'HY', 'HZ', 'JV', 'JW'],
    ['HQ', 'HR', 'HS', 'HT', 'HU', 'JQ', 'JR'],
    ['HL', 'HM', 'HN', 'HO', 'HP', 'JL', 'JM']
  ];

  const x = Math.floor(coordinates.ea / 100000);
  const y = Math.floor(coordinates.no / 100000);

  const prefix = prefixes[y][x];

  const e = Math.floor(coordinates.ea % 100000);
  const n = Math.floor(coordinates.no % 100000);

  const ePadded = String(e).padStart(5, '0');
  const nPadded = String(n).padStart(5, '0');

  const text = `${prefix} ${ePadded} ${nPadded}`;
  const html = `${prefix}&thinsp;${ePadded}&thinsp;${nPadded}`;

  return { text: text, html: html, letters: prefix, eastings: ePadded, northings: nPadded };
}

/**
 * Return easting + northing from an input grid reference.
 * @param gridref - The grid reference to be converted.
 */
export function fromGridRef(gridref: string): EastingNorthing | Record<string, never> {
  gridref = String(gridref).trim();

  const test = validateGridRef(gridref);
  if (!test.valid) {
    console.log(test.message);
    return {};
  }

  const gridLetters = 'VWXYZQRSTULMNOPFGHJKABCDE';

  const ref = gridref.toUpperCase().replace(/ /g, '');

  const majorEasting = (gridLetters.indexOf(ref[0]) % 5) * 500000 - 1000000;
  const majorNorthing = Math.floor(gridLetters.indexOf(ref[0]) / 5) * 500000 - 500000;

  const minorEasting = (gridLetters.indexOf(ref[1]) % 5) * 100000;
  const minorNorthing = Math.floor(gridLetters.indexOf(ref[1]) / 5) * 100000;

  const i = (ref.length - 2) / 2;
  const m = Math.pow(10, 5 - i);

  const e = majorEasting + minorEasting + Number(ref.substring(2, i + 2)) * m;
  const n = majorNorthing + minorNorthing + Number(ref.substring(i + 2)) * m;

  return { ea: e, no: n };
}
