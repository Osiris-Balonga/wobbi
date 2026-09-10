# TDD log

Each numbered slice records its focused RED run before implementation, followed by GREEN and the relevant regression scope. Initial repository contained six reference images only; no Git history, source or conventions existed.

## 1. Domain
RED: npm run test:unit — missing packages/core/config.js (after dependency installation completed). GREEN: 4 tests pass. Implemented validated defaults, slug normalization, eight states and bounded ordered motion plans. Registry supplies six local presets.

## 2. SVG renderer
RED: npm run test:components — missing Mascot.jsx. GREEN: 3 tests pass. Same shape across eight expressions; live geometry, eyes and optional mouth; labelled size props; reduced-motion cancels WAAPI. Nested transform groups keep movement composition editable.
