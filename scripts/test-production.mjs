import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cli = fileURLToPath(
  new URL('../node_modules/@playwright/test/cli.js', import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [cli, 'test', 'tests/e2e', '--workers=1'],
  {
    stdio: 'inherit',
    env: { ...process.env, WOBBI_PRODUCTION: '1' },
  },
);
process.exitCode = result.status ?? 1;
