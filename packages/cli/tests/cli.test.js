// @vitest-environment node
import { it, expect, afterEach } from 'vitest';
import {
  mkdtemp,
  readFile,
  writeFile,
  rm,
  readdir,
  mkdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createConfig } from '../../core/config.js';
const folders = [];
async function folder() {
  const dir = await mkdtemp(path.join(tmpdir(), 'wobbi-cli-'));
  folders.push(dir);
  return dir;
}
const cli = path.resolve('packages/cli/bin/wobbi.js');
const run = (cwd, ...args) =>
  spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
afterEach(async () => {
  await Promise.all(
    folders.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});
it('installs eight focused sources into newly created default directories', async () => {
  const cwd = await folder();
  const result = run(cwd, 'add', 'ghost-eye');
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('local registry');
  expect(
    (await readdir(path.join(cwd, 'src/components/mascot'))).sort(),
  ).toEqual([
    'GhostEye.css',
    'GhostEye.jsx',
    'index.js',
    'motion.js',
    'preset.js',
    'render-effects.js',
    'render-model.js',
    'render.js',
  ]);
  expect(
    await readFile(
      path.join(cwd, 'src/components/mascot/GhostEye.jsx'),
      'utf8',
    ),
  ).toContain('export function GhostEye');
});
it('supports folders with spaces and explicit Vue exports', async () => {
  const cwd = await folder();
  const result = run(
    cwd,
    'add',
    'ghost-eye',
    '--dir',
    'my components/buddy',
    '--framework',
    'vue',
  );
  expect(result.status, result.stderr).toBe(0);
  expect(
    await readFile(path.join(cwd, 'my components/buddy/GhostEye.vue'), 'utf8'),
  ).toContain("from 'vue'");
});
it('preflights every conflict without partial writes and overwrites only with force', async () => {
  const cwd = await folder();
  await mkdir(path.join(cwd, 'target'));
  await writeFile(path.join(cwd, 'target/GhostEye.css'), 'my own source');
  const failed = run(cwd, 'add', 'ghost-eye', '--dir', 'target');
  expect(failed.status).toBe(1);
  expect(failed.stderr).toContain('--force');
  expect(await readdir(path.join(cwd, 'target'))).toEqual(['GhostEye.css']);
  expect(await readFile(path.join(cwd, 'target/GhostEye.css'), 'utf8')).toBe(
    'my own source',
  );
  expect(
    run(cwd, 'add', 'ghost-eye', '--dir', 'target', '--force').status,
  ).toBe(0);
  expect(
    await readFile(path.join(cwd, 'target/GhostEye.css'), 'utf8'),
  ).toContain('prefers-reduced-motion');
});
it.each([
  ['add', 'missing'],
  ['add', '../evil'],
  ['wat'],
  ['add', 'ghost-eye', '--dir'],
  ['add', 'ghost-eye', '--unknown'],
])('rejects invalid invocation %j', async (...args) => {
  const result = run(await folder(), ...args);
  expect(result.status).toBe(1);
  expect(result.stderr).toMatch(/Wobbi:/);
});
it('imports a custom studio configuration', async () => {
  const cwd = await folder();
  await writeFile(
    path.join(cwd, 'buddy.json'),
    JSON.stringify(
      createConfig({
        componentName: 'CustomBuddy',
        slug: 'custom-buddy',
        color: '#445566',
      }),
    ),
  );
  expect(
    run(cwd, 'add', '--config', 'buddy.json', '--dir', 'custom').status,
  ).toBe(0);
  expect(
    await readFile(path.join(cwd, 'custom/CustomBuddy.jsx'), 'utf8'),
  ).toContain("from './preset.js'");
  expect(await readFile(path.join(cwd, 'custom/preset.js'), 'utf8')).toContain(
    '#445566',
  );
});
it('rejects unsupported fields in imported configurations', async () => {
  const cwd = await folder();
  await writeFile(
    path.join(cwd, 'unsupported.json'),
    JSON.stringify({ ...createConfig(), retiredSetting: true }),
  );
  const result = run(
    cwd,
    'add',
    '--config',
    'unsupported.json',
    '--dir',
    'custom',
  );
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('unsupported fields');
  expect(await readdir(cwd)).toEqual(['unsupported.json']);
});
