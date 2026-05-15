import * as d3 from 'd3';
import * as turf from '@turf/turf';
import { Transform, TransformOptions } from '@grgmddn/os-transform';

import type { FeatureCollection, Feature } from 'geojson';

const options: TransformOptions = {
  mode: 'simple-towgs84'
};

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

d3.json('boundary.geojson').then(async (data: unknown) => {
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

  /**
   * Configure the Transform module:
   * - sets the mode to 'simple-towgs84'
   * - registers EPSG:27700 definition with proj4
   */
  await Transform.configure(options);

  const element = <HTMLPreElement>document.querySelector('#geojson pre');

  element.innerText = `File: boundary.geojson (City of Southampton)\n\n${JSON.stringify(geojson, null, 2)}`;

  const button = document.querySelector('#simple-towgs84 button');

  if (button) {
    button.addEventListener('click', async function () {
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

      for (let i: number = sw.ea; i < ne.ea; i += 1000) {
        for (let j: number = sw.no; j < ne.no; j += 1000) {
          const osRef: string = Transform.toGridRef({ ea: i, no: j }).text;
          const kmRef: string = osRef
            .split(' ')
            .map((val: string) => val.slice(0, 2))
            .join('');
          arrGridRef.push(kmRef);
        }
      }

      const pre = <HTMLPreElement>document.querySelector(`#${options.mode} pre`);
      pre.innerText = `KM Grid References (for BBOX Extent):\n${JSON.stringify(arrGridRef)}`;
      pre.className = 'msg';
    });
  }
});
