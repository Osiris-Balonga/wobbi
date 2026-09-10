# TDD log

Each numbered slice records its focused RED run before implementation, followed by GREEN and the relevant regression scope. Initial repository contained six reference images only; no Git history, source or conventions existed.

## 1. Domain
RED: npm run test:unit — missing packages/core/config.js (after dependency installation completed). GREEN: 4 tests pass. Implemented validated defaults, slug normalization, eight states and bounded ordered motion plans. Registry supplies six local presets.
