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
