# Wobbi

A local web studio for creating, animating, and exporting a reusable mascot. The SVG renderer, previews, and exports share the same engine, preserving the selected shape, colors, and depth.

## Requirements

- Node.js 24
- npm compatible with the lockfile

## Get started

```sh
npm ci
npm run dev
```

The studio is available at http://127.0.0.1:5173.

## Features

- 8 shapes, 12 eye styles, 8 mouths, head details, and accessories compatible with each shape.
- Flat, soft, or deep shading; independent colors; and a customizable background.
- 10 animated reactions, gaze tracking, pause, and support for reduced motion preferences.
- A 40-step history and local saving.
- Strict JSON import for projects in the current format.
- React, Vue, standalone JavaScript, PNG, SVG, GIF, WebM, and JSON project exports.
- English and French interface, selected from browser preferences or the language menu.

Export previews use the project background color. Transparency is available for image formats that support it.

## Use an export

The React ZIP contains a component, its styles, the preset, and rendering and animation modules. It can also be used as a Next.js client component.

```jsx
import { Wobbi } from './mascot';

<Wobbi state="loading" size={160} interactive playing />;
```

The JavaScript ZIP includes a standalone demo that opens directly from `index.html`, plus an API that does not require React:

```js
const mascot = window.WobbiMascot.createMascot(
  document.querySelector('#mascot'),
);

mascot.setState('loading');
mascot.setPlaying(false);
mascot.destroy();
```

## Verify

```sh
npm run check
npm run test:production
npm run test:visual
```

`npm run check` runs formatting, ESLint, unit, component, integration, contract, CLI, and accessibility tests, then builds the production bundle. Playwright covers browser flows and downloaded files.

## Architecture

- `packages/core`: configuration contract, SVG geometry, and animation engine.
- `packages/codegen`: React, Vue, and JavaScript output generation.
- `packages/registry` and `packages/cli`: local presets and command-line installation.
- `src/studio`: customization, stage, colors, and history.
- `src/export`: export dialog and media encoding.
- `src/i18n`: interface translations and locale selection.
- `public/brand`: brand assets used by the interface.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution workflow and [docs/architecture.md](./docs/architecture.md) for module responsibilities.
