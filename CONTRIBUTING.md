# Contributing to Wobbi

## Setup

Use Node.js 24, then install the locked dependencies:

```sh
npm ci
```

Create a short, descriptive branch from `dev` (`feature/...`, `fix/...`, `docs/...`, or `chore/...`) and open a pull request into `dev`. Release pull requests go from `dev` into `main`. Keep unrelated changes in separate pull requests.

## Required checks

Before opening a pull request, run:

```sh
npm run check
npm run test:production
npm run test:visual
```

Interface changes should include relevant behavior checks. Update a reference screenshot only after inspecting the result, never to hide an unexplained failure.

Project imports are untrusted input: validate the raw document before building a configuration. Exports must remain independent and preserve the studio rendering.

Keep repository documentation and developer-facing text in English. Localize product text in the supported languages; avoid changing stable configuration keys or export APIs just to translate labels.

## Pull requests

Link the related issue and describe the problem, solution, checks performed, and visual impact. Pull requests should be focused, reviewable, and green in CI before merging.
