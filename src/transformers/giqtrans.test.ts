import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';
import { toLatLng, fromLatLng } from './giqtrans';

const CGI_PATH = 'http://localhost/cgi-bin/giqtrans';

/*
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

after(async () => {
  await mockAgent.close();
  setGlobalDispatcher(new Agent());
});

describe('giqtrans.toLatLng', () => {
  it('returns the correct lat from the response', async () => {
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [-2.9679374, 54.42481] });

    const result = await toLatLng({ ea: 337297, no: 503695 }, 7, CGI_PATH);
    assert.equal(result.lat, 54.42481);
  });

  it('returns the correct lng from the response', async () => {
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [-2.9679374, 54.42481] });

    const result = await toLatLng({ ea: 337297, no: 503695 }, 7, CGI_PATH);
    assert.equal(result.lng, -2.9679374);
  });

  it('rounds to the specified number of decimal places', async () => {
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [-2.9679374, 54.42481] });

    const result = await toLatLng({ ea: 337297, no: 503695 }, 3, CGI_PATH);
    assert.equal(result.lat, 54.425);
    assert.equal(result.lng, -2.968);
  });
});

describe('giqtrans.fromLatLng', () => {
  it('returns the correct easting from the response', async () => {
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [337297, 503695] });

    const result = await fromLatLng({ lat: 54.42481, lng: -2.9679374 }, 2, CGI_PATH);
    assert.equal(result.ea, 337297);
  });

  it('returns the correct northing from the response', async () => {
    mockAgent
      .get('http://localhost')
      .intercept({ path: '/cgi-bin/giqtrans', method: 'POST' })
      .reply(200, { coordinates: [337297, 503695] });

    const result = await fromLatLng({ lat: 54.42481, lng: -2.9679374 }, 2, CGI_PATH);
    assert.equal(result.no, 503695);
  });
});
