import * as geotiff from 'geotiff';

import { EastingNorthing, Transform, TransformOptions } from '@grgmddn/os-transform';

const p1 = { ea: 337297, no: 503695 };
const p2 = { lat: 54.4248099897757, lng: -2.96793742316253 };
const gr = 'NY 37297 03695';

const ostn15Def =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs';

function printMessage(str: string, mode: TransformOptions['mode']): void {
  const pre = <HTMLPreElement>document.querySelector(`#${mode} pre`);
  pre.innerText = str;
  pre.className = 'msg';
}

async function asyncMakeRequests(): Promise<string> {
  let msg = '';
  msg += `> Transform.toLatLng(${JSON.stringify(p1)})\n`;
  msg += `  ${JSON.stringify(await Transform.toLatLng(p1))}\n\n`;
  msg += `> Transform.toLatLng(${JSON.stringify(p1)}, 14)\n`;
  msg += `  ${JSON.stringify(await Transform.toLatLng(p1, 14))}\n\n`;
  msg += `> Transform.fromLatLng(${JSON.stringify(p2)})\n`;
  msg += `  ${JSON.stringify(await Transform.fromLatLng(p2))}\n\n`;
  msg += `> Transform.toGridRef(${JSON.stringify(p1)})\n`;
  msg += `  ${JSON.stringify(Transform.toGridRef(p1))}\n\n`;
  msg += `> Transform.toGridRef(Transform.fromLatLng(${JSON.stringify(p2)}))\n`;
  msg += `  ${JSON.stringify(Transform.toGridRef(Transform.fromLatLng(p2) as EastingNorthing))}\n\n`;
  msg += `> Transform.fromGridRef("${gr}")\n`;
  msg += `  ${JSON.stringify(Transform.fromGridRef(gr))}\n`;

  return msg;
}

document.querySelector('#ostn15-cgi button')!.addEventListener('click', async function () {
  const options: TransformOptions = {
    mode: 'ostn15-cgi',
    cgiPath: '/cgi-bin/giqtrans'
  };

  await Transform.configure(options);

  const result = await asyncMakeRequests();

  printMessage(result, options.mode);
});

document.querySelector('#ostn15-gsb button')!.addEventListener('click', async function () {
  const options: TransformOptions = {
    mode: 'ostn15-gsb',
    gsbPath: 'resources/OSTN15_NTv2_OSGBtoETRS.gsb',
    proj4: {
      nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
      defs: { ostn15: ostn15Def }
    }
  };

  await Transform.configure(options);

  const result = await asyncMakeRequests();

  printMessage(result, options.mode);
});

document.querySelector('#ostn15-tif button')!.addEventListener('click', async function () {
  const options: TransformOptions = {
    mode: 'ostn15-tif',
    tifPath: 'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif',
    geotiff: geotiff,
    proj4: {
      nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
      defs: { ostn15: ostn15Def }
    }
  };

  await Transform.configure(options);

  const result = await asyncMakeRequests();

  printMessage(result, options.mode);
});

document.querySelector('#simple-towgs84 button')!.addEventListener('click', async function () {
  const options: TransformOptions = {
    mode: 'simple-towgs84'
  };

  await Transform.configure(options);

  const result = await asyncMakeRequests();

  printMessage(result, options.mode);
});
