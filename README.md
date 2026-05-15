# OS Transform

A set of TypeScript/JavaScript helper functions for transforming between the OSGB36/British National Grid (EPSG:27700) and WGS84 (EPSG:4326) coordinate systems and for converting OS Grid References.

> This is a community fork of [OrdnanceSurvey/os-transform](https://github.com/OrdnanceSurvey/os-transform), rewritten as TypeScript ES modules.

## Installation

Ensure you have Node.js 22 or later installed. The library may work on earlier versions, but this has not been tested.

Install with npm:

```bash
npm install @grgmddn/os-transform
```

## Getting Started

Import the Transform module and pass a configuration object to `Transform.configure()` to set up your desired mode:

```typescript
import { Transform } from '@grgmddn/os-transform';

Transform.configure({
  mode: 'ostn15-cgi',
  cgiPath: '/path/to/cgi-bin'
});

await Transform.toLatLng({
  ea: 337297,
  no: 503695
});
// Returns:
// {
//   "lat": 54.42481,
//   "lng": -2.9679374
// }
```

`Transform.configure()` can be called multiple times. Each call replaces the current configuration, so subsequent calls to `toLatLng()` or `fromLatLng()` will use the most recently provided settings.

## Transformers

The library supports four transformation modes, controlled via the `mode` option in the configuration object. These modes are grouped into two underlying transformers:

| Mode             | Transformer | Requirements                                                                                     | Accuracy        |
|------------------|-------------|--------------------------------------------------------------------------------------------------|-----------------|
| `ostn15-cgi`     | GIQTrans    | A running Grid InQuest II instance                                                               | Full OSTN15     |
| `ostn15-gsb`     | Proj4js     | Packages: `proj4`<br>NTv2 grid shift file (`.gsb`)                                               | Full OSTN15     |
| `ostn15-tif`     | Proj4js     | Packages: `proj4`, `geotiff`<br>GeoTIFF grid file (`.tif`)                                       | Full OSTN15     |
| `simple-towgs84` | Proj4js     | Packages: `proj4`                                                                                | ~95% (±3.5 m)   |

### GIQTrans transformer (`ostn15-cgi`)

When using this mode, the library acts as a thin wrapper that delegates coordinate transformations to a running instance of [Grid InQuest II (GIQTrans)](https://www.ordnancesurvey.co.uk/business-government/tools-support/os-net/for-developers) via HTTP requests to its CGI endpoint[^1]. No additional npm dependencies are required.

[^1]: GIQTrans (provided as part of the Grid InQuest II software) is an executable binary which can be placed in the `cgi-bin` directory on your web server to perform the OSTN15 transformation. Common Gateway Interface (CGI) is a standard that allows a web server to execute external programs and return their output as an HTTP response.

To use GIQTrans you must specify your CGI path in the configuration object:

```typescript
import { Transform } from '@grgmddn/os-transform';

Transform.configure({
  mode: 'ostn15-cgi',
  cgiPath: '/path/to/cgi-bin'
});

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

#### Options

| Option      | Type     | Required | Description                                                                                                           |
|-------------|----------|----------|-----------------------------------------------------------------------------------------------------------------------|
| `mode`      | `string` | Yes      | Sets the transformer. Must be `'ostn15-cgi'` to use this mode.                                                        |
| `cgiPath`   | `string` | Yes      | Path or URL of the GIQTrans CGI endpoint.                                                                             |
| `maxBounds` | `object` | No       | Optional bounding box to restrict transformations. Defaults to projected and geographic coordinates for extent of GB. |

### Proj4js transformer

[Proj4js](http://proj4js.org/) is a JavaScript library for transforming point coordinates from one coordinate system to another, including datum transformations. Version 2.7.0 and above includes support for [grid-based datum adjustments](https://github.com/proj4js/proj4js#grid-based-datum-adjustments) using the `+nadgrids` keyword in a coordinate system definition.

All three Proj4js-based modes require `proj4` to be installed:

```bash
npm install "proj4@>=2.7.0"
```

---

#### NTv2 mode — `.gsb` file (`ostn15-gsb`)

This mode achieves full OSTN15 accuracy using a NTv2 grid shift file (`.gsb`).

Pass the following into the configuration object:
- the path to your `.gsb` file (`gsbPath`)
- the nadgrid registration key (`proj4.nadgrid`)
- the proj4 definition string for `EPSG:27700` (`proj4.defs.ostn15`)

```typescript
import { Transform } from '@grgmddn/os-transform';

Transform.configure({
  mode: 'ostn15-gsb',
  gsbPath: 'path/to/OSTN15_NTv2_OSGBtoETRS.gsb',
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
    defs: {
      ostn15: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs'
    }
  }
});

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

> `OSTN15_NTv2_OSGBtoETRS.gsb`, included in the examples, is also available as part of the [NTv2 format files](https://www.ordnancesurvey.co.uk/business-government/tools-support/os-net/for-developers) provided by Ordnance Survey.

##### Options

| Option              | Type     | Required | Description                                                                                                                           |
|---------------------|----------|----------|---------------------------------------------------------------------------------------------------------------------------------------|
| `mode`              | `string` | Yes      | Must be `'ostn15-gsb'`.                                                                                                               |
| `gsbPath`           | `string` | Yes      | Path or URL to the NTv2 `.gsb` grid shift file.                                                                                       |
| `proj4.nadgrid`     | `string` | Yes      | The key used to register the grid data via `proj4.nadgrid`. Must match the `+nadgrids=` value in `proj4.defs.ostn15`.                 |
| `proj4.defs.ostn15` | `string` | Yes      | The proj4 definition string for EPSG:27700. The `+nadgrids=` parameter must match the key provided in `proj4.nadgrid`.                |
| `maxBounds`         | `object` | No       | Optional bounding box to restrict transformations. Defaults to projected and geographic coordinates for extent of GB.                 |

---

#### GeoTIFF mode — `.tif` file (`ostn15-tif`)

This mode achieves full OSTN15 accuracy using a GeoTIFF grid file (`.tif`).

The `geotiff` package is required:
```bash
npm install geotiff
```

Then inject the entire `geotiff` module into `Transform` via the configuration object, along with:
- the path to your `.tif` file (`tifPath`)
- the nadgrid registration key (`proj4.nadgrid`)
- the proj4 definition string for `EPSG:27700` (`proj4.defs.ostn15`)

```typescript
import * as GeoTIFF from 'geotiff';

import { Transform } from '@grgmddn/os-transform';

Transform.configure({
  mode: 'ostn15-tif',
  geotiff: GeoTIFF,
  tifPath: 'path/to/uk_os_OSTN15_NTv2_OSGBtoETRS.tif',
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS',
    defs: {
      ostn15: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs'
    }
  }
});

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

> `uk_os_OSTN15_NTv2_OSGBtoETRS.tif`, included in the examples, is also available from [https://cdn.proj.org/](https://cdn.proj.org/).

##### Options

| Option              | Type                       | Required | Description                                                                                                                                 |
|---------------------|----------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `mode`              | `string`                   | Yes      | Must be `'ostn15-tif'`.                                                                                                                     |
| `geotiff`           | `typeof import('geotiff')` | Yes      | The `geotiff` module instance, imported and passed in by the caller.                                                                        |
| `tifPath`           | `string`                   | Yes      | Path or URL to the GeoTIFF `.tif` grid file.                                                                                                |
| `proj4.nadgrid`     | `string`                   | Yes      | The key used to register the grid data via `proj4.nadgrid`. Must match the `+nadgrids=` value in `proj4.defs.ostn15`.                       |
| `proj4.defs.ostn15` | `string`                   | Yes      | The proj4 definition string for EPSG:27700. The `+nadgrids=` parameter must match the key provided in `proj4.nadgrid`.                      |
| `maxBounds`         | `object`                   | No       | Optional bounding box to restrict transformations. Defaults to projected and geographic coordinates for extent of GB.                       |

---

#### Helmert mode (`simple-towgs84`)

This transformation (more commonly known as a [Helmert datum transformation](https://en.wikipedia.org/wiki/Helmert_transformation)) is an averaged transformation between the two datums which smooths out localised distortions in OSGB36/British National Grid. Because the transformation uses a single set of parameters for the whole country, it has 95th-percentile accuracy, with errors of up to ±3.5 m.

No additional dependencies, grid files, or definition strings are required for the default configuration:

```typescript
import { Transform } from '@grgmddn/os-transform';

Transform.configure({
  mode: 'simple-towgs84'
});

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

To use a custom Helmert transformation, pass a proj4 definition string containing the [`+towgs84=` parameter](https://github.com/proj4js/proj4js/blob/main/README.md#datum-transformations):

```typescript
import { Transform } from '@grgmddn/os-transform';

Transform.configure({
  mode: 'simple-towgs84',
  proj4: {
    defs: {
      towgs84: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs'
    }
  }
});

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

##### Options

| Option               | Type     | Required | Description                                                                                                                                                                                                                           |
|----------------------|----------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mode`               | `string` | Yes      | Must be `'simple-towgs84'`.                                                                                                                                                                                                           |
| `proj4.defs.towgs84` | `string` | No       | A custom proj4 definition string using the `+towgs84=` [Helmert transformation parameters](https://github.com/proj4js/proj4js/blob/main/README.md#datum-transformations). If omitted, the library falls back to a default definition. |
| `maxBounds`          | `object` | No       | Optional bounding box to restrict transformations. Defaults to projected and geographic coordinates for extent of GB.                                                                                                                 |


## Usage

### `Transform.toLatLng()`

Asynchronously returns latitude/longitude from an input easting and northing.

| Parameter     | Type      | Required | Default | Description                                     |
|---------------|-----------|----------|---------|-------------------------------------------------|
| `coordinates` | `object`  | Yes      | —       | Object with `ea` (easting) and `no` (northing). |
| `decimals`    | `number`  | No       | `7`     | Number of decimal places to return.             |

```typescript
await Transform.toLatLng({
  ea: 337297,
  no: 503695
});
// Returns:
// {
//   "lat": 54.42481,
//   "lng": -2.9679374
// }
```

### `Transform.fromLatLng()`

Asynchronously returns easting and northing from an input latitude/longitude.

| Parameter     | Type      | Required | Default | Description                         |
|---------------|-----------|----------|---------|-------------------------------------|
| `coordinates` | `object`  | Yes      | —       | Object with `lat` and `lng`.        |
| `decimals`    | `number`  | No       | `2`     | Number of decimal places to return. |

```typescript
await Transform.fromLatLng({
  lat: 54.42480998276385,
  lng: -2.96793742245737
});
// Returns:
// {
//   "ea": 337297,
//   "no": 503695
// }
```

### `Transform.toGridRef()`

Synchronously returns a grid reference (plain text, HTML-encoded, and components) from an input easting and northing.

| Parameter     | Type     | Required | Description                                     |
|---------------|----------|----------|-------------------------------------------------|
| `coordinates` | `object` | Yes      | Object with `ea` (easting) and `no` (northing). |

```typescript
Transform.toGridRef({
  ea: 337297,
  no: 503695
});
// Returns:
// {
//   "text": "NY 37297 03695",
//   "html": "NY&thinsp;37297&thinsp;03695",
//   "letters": "NY",
//   "eastings": "37297",
//   "northings": "03695"
// }
```

> [!NOTE]
>
> Eastings and northings are returned as strings to preserve leading zeros (e.g. `"03695"`).

### `Transform.fromGridRef()`

Synchronously returns easting and northing from an input grid reference string.

| Parameter  | Type     | Required | Description                    |
|------------|----------|----------|--------------------------------|
| `gridref`  | `string` | Yes      | The grid reference to convert. |

```typescript
Transform.fromGridRef("NY 37297 03695");
// Returns:
// {
//   "ea": 337297,
//   "no": 503695
// }
```

## Examples

Example implementations for each transformer mode are located in the `/examples` directory, which is set up as an npm workspace using [Parcel](https://parceljs.org/) as the bundler.

### Setup

The examples import the library from the `/dist` directory, so the library must be built before running any example:

```bash
# In the root of the project:
npm run build
```

Then install the example workspace dependencies:

```bash
cd examples
npm install
```

### Running an example

Each transformer mode has a corresponding dev script:

| Script          | Mode             | Command                   |
|-----------------|------------------|---------------------------|
| `dev:cgi`       | `ostn15-cgi`     | `npm run dev:cgi`         |
| `dev:gsb`       | `ostn15-gsb`     | `npm run dev:gsb`         |
| `dev:tif`       | `ostn15-tif`     | `npm run dev:tif`         |
| `dev:simple`    | `simple-towgs84` | `npm run dev:simple`      |
| `dev:test`      | All              | `npm run dev:test`        |

To build all examples for production:

```bash
npm run build
```

## Background

In August 2016, Ordnance Survey released a transformation grid called OSTN15 which improves the accuracy of the transformation between OSGB36/British National Grid and WGS84[^2]. It does this by implementing a 'rubber-sheet' style transformation that works by using bilinear interpolation to essentially apply different transformations in different parts of the country.

[^2]: OSTN15 is actually a transformation to [European Terrestrial Reference System 1989 (ETRS89)](https://en.wikipedia.org/wiki/European_Terrestrial_Reference_System_1989), which can be considered as a higher accuracy version of WGS84 for Europe.

You can find more information in relation to the transformation by [reading the Ordnance Survey guide to coordinate systems in Great Britain](https://www.ordnancesurvey.co.uk/documents/resources/guide-coordinate-systems-great-britain.pdf) (PDF).

## Attribution

This library is a TypeScript port of [os-transform](https://github.com/OrdnanceSurvey/os-transform) by Ordnance Survey, used under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
