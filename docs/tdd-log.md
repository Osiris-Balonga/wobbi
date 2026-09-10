# TDD log

Each numbered slice records its focused RED run before implementation, followed by GREEN and the relevant regression scope. Initial repository contained six reference images only; no Git history, source or conventions existed.

## 1. Domain

RED: npm run test:unit — missing packages/core/config.js (after dependency installation completed). GREEN: 4 tests pass. Implemented validated defaults, slug normalization, eight states and bounded ordered motion plans. Registry supplies six local presets.

## 2. SVG renderer

RED: npm run test:components — missing Mascot.jsx. GREEN: 3 tests pass. Same shape across eight expressions; live geometry, eyes and optional mouth; labelled size props; reduced-motion cancels WAAPI. Nested transform groups keep movement composition editable.

## 3. Code generation

RED: npm run test:contracts — missing generator module. GREEN: 2 contracts and 5 domain/unit tests pass. Contracts write real sources to OS temporary folders, compile with esbuild and import/render each state. Node environment is used for filesystem/compiler contracts to avoid jsdom realm issues. Browser and Node adapters read the same canonical source as raw text, so production minification cannot corrupt exported functions.

## 4. CLI

RED: npm run test:cli — 9 failures, missing CLI executable. GREEN: 9 tests pass in temporary directories. Added local registry installs, custom JSON configurations, Next.js, path handling and conflict preflight. No files are written on a detected conflict; --force is explicit.

## 5. Studio workflows

RED: focused component/integration/a11y run — missing App.jsx (three suites). GREEN: 12 renderer/studio/integration/accessibility tests pass; build succeeds. Added all design controls, synchronized preview/grid/motion, saved settings, coherent global theme, actual ZIP/config downloads, copy feedback and accessible tabs. A lint check caught synchronous effect state updates; persistence now runs at the edit boundary. Fonts are bundled locally.

## 6. Browser and visual validation

RED: `npm run test:e2e` failed to select the Framework field by its exact label. Changed Field to an explicitly associated label/control pair. GREEN: all 4 full browser journeys pass, including a real downloaded ZIP compiled with esbuild, clipboard reads, refresh/restore, live reduced-motion changes, offscreen pause, keyboard navigation, Axe contrast checks and a 390 px viewport.

Visual review corrected undersized color inputs, small movement reorder targets, dark shape-icon contrast and the Happy/Sad eye curves. The five supplied screenshots were opened and compared with the eight implemented screens. Initial snapshots were created with `npm run test:visual -- --update-snapshots`; a subsequent comparison detected one blank snapshot captured during a formatting-triggered reload. Added explicit readiness assertions and recaptured that screen, rather than accepting a blank reference. The normal visual suite then compares against the reviewed images.

## 7. Refactoring and regression checks

Prettier formatted all authored source and tests. The stylesheet was separated into theme, shared controls, preview, motion, settings, export and responsive modules. The generated-source contracts were rerun after formatting to verify that raw source extraction still compiles. An additional contract imports the emitted animation module and verifies live reduced-motion handling and listener/animation cleanup. `test:production` runs the same browser workflows against `vite preview` after a production build.

Tests were committed before the implementation of the domain, renderer, generator, CLI and studio workflows. No Git hooks existed; no hooks were bypassed. The studio's interacting panels share one test specification commit rather than an independent RED commit for every individual control.
