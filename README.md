# OS Transform

A set of TypeScript/JavaScript helper functions for transforming between the OSGB36/British National Grid (EPSG:27700) and WGS84 (EPSG:4326) coordinate systems, as well as providing support for OS Grid Reference conversions.

> This is a community fork of [OrdnanceSurvey/os-transform](https://github.com/OrdnanceSurvey/os-transform), rewritten as TypeScript ES modules.

## Installation

Install the package via npm:

```bash
npm install @grgmddn/os-transform
```

## Configuration

The library supports four transformation modes, controlled via the `type` option on `Transform.options`. These modes are grouped into two underlying transformers:

| Mode             | Transformer | Requirements                                                                                     | Accuracy        |
|------------------|-------------|--------------------------------------------------------------------------------------------------|-----------------|
| `ostn15-cgi`     | GIQTrans    | A running Grid InQuest II instance                                                               | Full OSTN15     |
| `ostn15-gsb`     | Proj4js     | Packages: `proj4`<br>NTv2 grid shift file (`.gsb`)                                               | Full OSTN15     |
| `ostn15-tif`     | Proj4js     | Packages: `proj4`, `geotiff`<br>GeoTIFF grid file (`.tif`)                                       | Full OSTN15     |
| `simple-towgs84` | Proj4js     | Packages: `proj4`                                                                                | ~95% (±3.5 m)   |

### GIQTrans transformer [default] (`ostn15-cgi`)

This is the default transformer. No additional npm dependencies are required for this mode.

When using this mode, the library acts as a thin wrapper that delegates coordinate transformations to a running instance of [Grid InQuest II (GIQTrans)](https://www.ordnancesurvey.co.uk/business-government/tools-support/os-net/for-developers) via HTTP requests to its CGI endpoint.

GIQTrans (provided as part of the Grid InQuest II software) is an executable binary which can be placed in the `CGI-BIN` directory on your web server to perform the OSTN15 transformation. Common Gateway Interface (CGI) is a standard that allows a web server to execute external programs and return their output as an HTTP response.

#### Options

| Option    | Type     | Default               | Description                                                                       |
|-----------|----------|-----------------------|-----------------------------------------------------------------------------------|
| `type`    | `string` | `'ostn15-cgi'`        | Sets the transformer. This is the default and does not need to be set explicitly. |
| `cgiPath` | `string` | `'/cgi-bin/giqtrans'` | Path or URL of the GIQTrans CGI endpoint.                                         |

To use GIQTrans with the default CGI path, no configuration is needed:

```typescript
import { Transform } from '@grgmddn/os-transform';

/*
 * No configuration required — 'ostn15-cgi' is the default transformer.
 * Ensure your Grid InQuest II server is running and accessible at the default
 * path ('/cgi-bin/giqtrans') before calling any transformation functions.
 */
const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

To use a custom GIQTrans endpoint, set `cgiPath` via `Transform.options`:

```typescript
import { Transform } from '@grgmddn/os-transform';

Transform.options = {
  cgiPath: '/path/to/cgi-bin'
};

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

### Proj4js transformer

[Proj4js](http://proj4js.org/) is a JavaScript library for transforming point coordinates from one coordinate system to another, including datum transformations. Version 2.7.0 and above includes support for [grid-based datum adjustments](https://github.com/proj4js/proj4js#grid-based-datum-adjustments) using the `+nadgrids` keyword in a coordinate system definition.

> **Note:** This library does not configure Proj4js internally. Due to the nature of this port, Proj4js must be imported and configured manually before any transformation functions are called. The examples below show the required setup for each mode.

All three Proj4js-based modes require `proj4` to be installed:

```bash
npm install proj4
```

- **`ostn15-gsb`** — Full OSTN15 accuracy using a NTv2 grid shift file (`.gsb`).
- **`ostn15-tif`** — Full OSTN15 accuracy using a GeoTIFF grid file (`.tif`). Also requires the `geotiff` package.
- **`simple-towgs84`** — Helmert datum transformation; no grid file required, accuracy of ~95% (±3.5 m).

#### Options

| Option                 | Type                                   | Default                                         | Mode                       | Description |
|------------------------|----------------------------------------|-------------------------------------------------|----------------------------|-------------|
| `type`                 | `string`                               | `'ostn15-cgi'`                                  | All                        | Sets the active transformer mode. |
| `gsbPath`              | `string`                               | `'resources/OSTN15_NTv2_OSGBtoETRS.gsb'`        | `ostn15-gsb`               | Path or URL to the NTv2 grid shift file. Used to fetch the file before passing it to Proj4js. |
| `tifPath`              | `string`                               | `'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif'`  | `ostn15-tif`               | Path or URL to the GeoTIFF grid file. Used to fetch the file before passing it to Proj4js. |
| `proj4.nadgrid`        | `string`                               | `'OSTN15_NTv2_OSGBtoETRS'`                      | `ostn15-gsb`, `ostn15-tif` | The key used to register the grid with Proj4js via `proj4.nadgrid()`. Must match the `+nadgrids` value in `proj4.defs.ostn15`. |
| `proj4.defs.ostn15`    | `string`                               | See default options                             | `ostn15-gsb`, `ostn15-tif` | The Proj4 definition string for EPSG:27700 using the OSTN15 nadgrid. Override if using a custom grid key. |
| `proj4.defs.towgs84`   | `string`                               | See default options                             | `simple-towgs84`           | The Proj4 definition string for EPSG:27700 using the Helmert `+towgs84` transformation. |

---

#### NTv2 mode — `.gsb` file (`ostn15-gsb`)

This mode achieves full OSTN15 accuracy using a NTv2 grid shift file (`.gsb`). The grid file must be fetched and registered with Proj4js before calling any transformation functions:

```typescript
import proj4 from 'proj4';
import { Transform } from '@grgmddn/os-transform';

Transform.options = {
  type: 'ostn15-gsb', // Sets the transformer.
  gsbPath: 'resources/OSTN15_NTv2_OSGBtoETRS.gsb', // Override if your file is located elsewhere. Used in the manual setup below; not yet consumed internally by the library.
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS', // Override to use a different NADGRID key. Used in the manual setup below; not yet consumed internally by the library.
    defs: {
      ostn15:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs' // Override to use a different projection. The library uses this to internally set a named projection using the proj4.defs method.
    }
  }
};

/*
 * Proj4js must be configured manually before calling any transformation functions.
 * Fetch the .gsb file and register it with Proj4js using the NADGRID key.
 */
const response = await fetch(Transform.options.gsbPath);
const arrayBuffer = await response.arrayBuffer();
proj4.nadgrid(Transform.options.proj4.nadgrid, arrayBuffer);

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

> `OSTN15_NTv2_OSGBtoETRS.gsb` is available as part of the [NTv2 format files](https://www.ordnancesurvey.co.uk/business-government/tools-support/os-net/for-developers) provided by Ordnance Survey.

---

#### GeoTIFF mode — `.tif` file (`ostn15-tif`)

This mode achieves full OSTN15 accuracy using a GeoTIFF grid file (`.tif`). The `geotiff` package is required:

```bash
npm install geotiff
```

The grid file must be fetched and registered with Proj4js before calling any transformation functions:

```typescript
import proj4 from 'proj4';
import * as GeoTIFF from 'geotiff';
import { Transform } from '@grgmddn/os-transform';

Transform.options = {
  type: 'ostn15-tif', // Sets the transformer.
  tifPath: 'resources/uk_os_OSTN15_NTv2_OSGBtoETRS.tif', // Override if your file is located elsewhere. Used in the manual setup below; not yet consumed internally by the library.
  proj4: {
    nadgrid: 'OSTN15_NTv2_OSGBtoETRS', // Override to use a different NADGRID key. Used in the manual setup below; not yet consumed internally by the library.
    defs: {
      ostn15:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS +units=m +no_defs +type=crs' // Override to use a different projection. The library uses this to internally set a named projection using the proj4.defs method.
    }
  }
};

/*
 * Proj4js must be configured manually before calling any transformation functions.
 * Fetch the .tif file, convert it to a GeoTIFF object, and register it with Proj4js
 * using the NADGRID key.
 */
const response = await fetch(Transform.options.tifPath);
const arrayBuffer = await response.arrayBuffer();
const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);

/*
 * Casting proj4 as 'any' is required to work around incorrect type definitions
 * in the proj4 package.
 */
await (proj4 as any).nadgrid(Transform.options.proj4.nadgrid, tiff).ready;

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

> `uk_os_OSTN15_NTv2_OSGBtoETRS.tif` is mirrored from [https://cdn.proj.org/](https://cdn.proj.org/).

---

#### Helmert mode (`simple-towgs84`)

This transformation (more commonly known as a [Helmert datum transformation](https://en.wikipedia.org/wiki/Helmert_transformation)) is an averaged transformation between the two datums which smooths out localised distortions in OSGB36/British National Grid. Because the transformation uses a single set of parameters for the whole country, it has a 95% accuracy and can give errors of up to 3.5 m (this value varies across the country).

No grid file or further dependencies are required:

```typescript
import { Transform } from '@grgmddn/os-transform';

/* The towgs84 definition string is sufficient for Proj4js to perform the transformation internally. */
Transform.options = {
  type: 'simple-towgs84', // Sets the transformer.
  proj4: {
    defs: {
      towgs84:
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs' // Override to use a different projection. The library uses this to internally set a named projection using the proj4.defs method.
    }
  }
};

const result = await Transform.toLatLng({ ea: 337297, no: 503695 });
```

## Usage

### `Transform.toLatLng()`

Returns latitude/longitude from an input easting and northing.

| Parameter     | Type      | Required | Default | Description                                    |
|---------------|-----------|----------|---------|------------------------------------------------|
| `coordinates` | `object`  | Yes      | —       | Object with `ea` (easting) and `no` (northing) |
| `decimals`    | `integer` | No       | `7`     | Number of decimal places to return             |

```typescript
await Transform.toLatLng({ ea: 337297, no: 503695 });
// Returns: { lat: 54.42481, lng: -2.9679374 }
```

### `Transform.fromLatLng()`

Returns easting and northing from an input latitude/longitude.

| Parameter     | Type      | Required | Default | Description                        |
|---------------|-----------|----------|---------|------------------------------------|
| `coordinates` | `object`  | Yes      | —       | Object with `lat` and `lng`        |
| `decimals`    | `integer` | No       | `2`     | Number of decimal places to return |

```typescript
await Transform.fromLatLng({ lat: 54.42480998276385, lng: -2.96793742245737 });
// Returns: { ea: 337297, no: 503695 }
```

### `Transform.toGridRef()`

Returns a grid reference (plain text, HTML-encoded, and components) from an input easting and northing.

| Parameter     | Type     | Required | Description                                    |
|---------------|----------|----------|------------------------------------------------|
| `coordinates` | `object` | Yes      | Object with `ea` (easting) and `no` (northing) |

```typescript
Transform.toGridRef({ ea: 337297, no: 503695 });
// Returns: { text: "NY 37297 03695", html: "NY&thinsp;37297&thinsp;03695", letters: "NY", eastings: "37297", northings: "03695" }
```

### `Transform.fromGridRef()`

Returns easting and northing from an input grid reference string.

| Parameter  | Type     | Required | Description                   |
|------------|----------|----------|-------------------------------|
| `gridref`  | `string` | Yes      | The grid reference to convert |

```typescript
Transform.fromGridRef("NY 37297 03695");
// Returns: { ea: 337297, no: 503695 }
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
| `dev:test`      | —                | `npm run dev:test`        |

To build all examples for production:

```bash
npm run build
```

## Background

In August 2016, Ordnance Survey released a transformation grid called OSTN15 which improves the accuracy of the transformation between OSGB36/British National Grid and WGS84<sup>[1]</sup>. It does this by implementing a 'rubber-sheet' style transformation that works by using bilinear interpolation to essentially apply different transformations in different parts of the country.

You can find more information in relation to the transformation by [reading the Ordnance Survey guide to coordinate systems in Great Britain](https://www.ordnancesurvey.co.uk/documents/resources/guide-coordinate-systems-great-britain.pdf) (PDF).

## Notes

<sup>[1]</sup> OSTN15 is actually a transformation to [European Terrestrial Reference System 1989 (ETRS89)](https://en.wikipedia.org/wiki/European_Terrestrial_Reference_System_1989), which can be considered as a higher accuracy version of WGS84 for Europe.

## Attribution

This library is a TypeScript port of [os-transform](https://github.com/OrdnanceSurvey/os-transform) by Ordnance Survey, used under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
