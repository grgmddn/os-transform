import * as d3 from 'd3';
import * as turf from '@turf/turf';
import proj4 from 'proj4';
import * as GeoTIFF from 'geotiff';
import { Transform } from '@grgmddn/os-transform';

import type { FeatureCollection, Feature } from 'geojson';

Transform.options.type = 'ostn15-tif';
Transform.options.tifPath = 'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif';

const roundUp = function (num: number | string, precision: number = 1000): number {
  return Math.ceil(parseFloat(num as string) / precision) * precision;
};

const roundDown = function (num: number | string, precision: number = 1000): number {
  return Math.floor(parseFloat(num as string) / precision) * precision;
};

const arrGridRef: string[] = [];

function rewind(geo: FeatureCollection): FeatureCollection {
  const fixedGeoJSON: FeatureCollection = { ...geo };
  fixedGeoJSON.features = fixedGeoJSON.features.map(
    (f: Feature) => turf.rewind(f, { reverse: true }) as Feature
  );
  return fixedGeoJSON;
}

d3.json('boundary.geojson').then((data: unknown) => {
  /* Cast the response as 'FeatureCollection'. */
  let geojson = data as FeatureCollection;

  geojson = rewind(geojson);

  const width: number = 400;
  const height: number = 300;
  const margin: number = 8;

  const projection = d3
    .geoMercator()
    .translate([width / 2, height / 2])
    .fitExtent(
      [
        [margin, margin],
        [width - margin, height - margin]
      ],
      geojson
    );

  const path = d3.geoPath().projection(projection);

  const svg = d3.select('svg');

  svg
    .selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', 'steelblue')
    .attr('stroke', 'white');

  const element = <HTMLPreElement>document.querySelector('#geojson pre');

  element.innerText = `File: boundary.geojson (City of Southampton)\n\n${JSON.stringify(geojson, null, 2)}`;

  const button = document.querySelector('#ostn15-tif button');

  if (button) {
    button.addEventListener('click', async function () {
      // const tiff = await GeoTIFF.fromUrl(Transform.options.tifPath);
      const response = await fetch(Transform.options.tifPath);
      const arrayBuffer = await response.arrayBuffer();
      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);

      /* Cast proj4 as 'any' to get around incorrect types. */
      // eslint-disable-next-line
      await (proj4 as any).nadgrid(Transform.options.proj4.nadgrid, tiff).ready;

      /**
       * The os-transform module configures proj4 mode.
       * proj4.defs('EPSG:27700', Transform.options.proj4.defs.ostn15);
       */

      const sw = await Transform.fromLatLng({
        lat: geojson.bbox![1],
        lng: geojson.bbox![0]
      });

      const ne = await Transform.fromLatLng({
        lat: geojson.bbox![3],
        lng: geojson.bbox![2]
      });

      Object.keys(sw).forEach((key: string) => {
        (sw as Record<string, number>)[key] = roundDown((sw as Record<string, number>)[key]);
      });
      Object.keys(ne).forEach((key: string) => {
        (ne as Record<string, number>)[key] = roundUp((ne as Record<string, number>)[key]);
      });

      for (let i = sw.ea; i < ne.ea; i += 1000) {
        for (let j = sw.no; j < ne.no; j += 1000) {
          const osRef = Transform.toGridRef({ ea: i, no: j }).text;
          const kmRef = osRef
            .split(' ')
            .map((val) => val.slice(0, 2))
            .join('');
          arrGridRef.push(kmRef);
        }
      }

      const pre = <HTMLPreElement>document.querySelector(`#${Transform.options.type} pre`);
      pre.innerText = `KM Grid References (for BBOX Extent):\n${JSON.stringify(arrGridRef)}`;
      pre.className = 'msg';
    });
  }
});
