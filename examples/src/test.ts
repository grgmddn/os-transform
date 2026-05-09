import proj4 from 'proj4';
import * as GeoTIFF from 'geotiff';
import { EastingNorthing, Transform } from '@grgmddn/os-transform';

const p1 = { ea: 337297, no: 503695 };
const p2 = { lat: 54.4248099897757, lng: -2.96793742316253 };
const gr = 'NY 37297 03695';

function returnMessage(str: string): void {
  const pre = <HTMLPreElement>document.querySelector(`#${Transform.options.type} pre`);
  pre.innerText = str;
  pre.className = 'msg';
}

function makeRequests(): void {
  let msg = '';
  msg += `> Transform.toLatLng(${JSON.stringify(p1)})\n`;
  msg += `  ${JSON.stringify(Transform.toLatLng(p1))}\n\n`;
  msg += `> Transform.toLatLng(${JSON.stringify(p1)}, 14)\n`;
  msg += `  ${JSON.stringify(Transform.toLatLng(p1, 14))}\n\n`;
  msg += `> Transform.fromLatLng(${JSON.stringify(p2)})\n`;
  msg += `  ${JSON.stringify(Transform.fromLatLng(p2))}\n\n`;
  msg += `> Transform.toGridRef(${JSON.stringify(p1)})\n`;
  msg += `  ${JSON.stringify(Transform.toGridRef(p1))}\n\n`;
  msg += `> Transform.toGridRef(Transform.fromLatLng(${JSON.stringify(p2)}))\n`;
  msg += `  ${JSON.stringify(Transform.toGridRef(Transform.fromLatLng(p2) as EastingNorthing))}\n\n`;
  msg += `> Transform.fromGridRef("${gr}")\n`;
  msg += `  ${JSON.stringify(Transform.fromGridRef(gr))}\n`;
  returnMessage(msg);
}

async function asyncMakeRequests(): Promise<void> {
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
  returnMessage(msg);
}

async function fetchAndProcessData(): Promise<void> {
  if (Transform.options.type == 'ostn15-gsb') {
    const response = await fetch(Transform.options.gsbPath);
    const arrayBuffer = await response.arrayBuffer();
    proj4.nadgrid(Transform.options.proj4.nadgrid, arrayBuffer);
  } else if (Transform.options.type == 'ostn15-tif') {
    // const tiff = await GeoTIFF.fromUrl(Transform.options.tifPath);
    const response = await fetch(Transform.options.tifPath);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    /* Cast proj4 as 'any' to get around incorrect types. */
    // eslint-disable-next-line
    await (proj4 as any).nadgrid(Transform.options.proj4.nadgrid, tiff).ready;
  }
  //proj4.defs('EPSG:27700', Transform.options.proj4.defs.ostn15);
  makeRequests();
}

document.querySelector('#ostn15-cgi button')!.addEventListener('click', function () {
  Transform.options.type = 'ostn15-cgi'; // -- DEFAULT
  asyncMakeRequests();
});

document.querySelector('#ostn15-gsb button')!.addEventListener('click', function () {
  Transform.options.type = 'ostn15-gsb';
  fetchAndProcessData();
});

document.querySelector('#ostn15-tif button')!.addEventListener('click', function () {
  Transform.options.type = 'ostn15-tif';
  Transform.options.tifPath = 'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif';
  fetchAndProcessData();
});

document.querySelector('#simple-towgs84 button')!.addEventListener('click', function () {
  Transform.options.type = 'simple-towgs84';
  proj4.defs('EPSG:27700', Transform.options.proj4.defs.towgs84);
  makeRequests();
});
