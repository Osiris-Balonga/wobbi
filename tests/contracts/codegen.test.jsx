// @vitest-environment node
import { it, expect, afterEach, vi } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import { generateFiles } from '../../packages/codegen/node.js';
import { createConfig, REACTIONS } from '../../packages/core/config.js';
const require = createRequire(import.meta.url);
const folders = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(
    folders.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});
it('writes exactly four editable files that compile, import and render all states', async () => {
  const config = createConfig({
    componentName: 'MyBuddy',
    size: 180,
    export: { framework: 'next' },
  });
  const files = generateFiles(config);
  expect(Object.keys(files)).toEqual([
    'MyBuddy.jsx',
    'animations.js',
    'styles.css',
    'index.js',
  ]);
  expect(files['MyBuddy.jsx']).toMatch(/^'use client'/);
  expect(Object.values(files).join('\n')).not.toMatch(
    /localStorage|src\/studio|fetch\(/,
  );
  const dir = await mkdtemp(path.join(tmpdir(), 'wobbi-contract-'));
  folders.push(dir);
  await Promise.all(
    Object.entries(files).map(([name, source]) =>
      writeFile(path.join(dir, name), source),
    ),
  );
  const result = await build({
    entryPoints: [path.join(dir, 'index.js')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    external: ['react'],
    loader: { '.css': 'empty' },
    jsx: 'automatic',
    nodePaths: [path.resolve('node_modules')],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  const { MyBuddy } = module.exports;
  expect(MyBuddy).toBeTypeOf('function');
  for (const state of REACTIONS) {
    const html = renderToStaticMarkup(
      <MyBuddy
        state={state}
        size={128}
        aria-label="Exported buddy"
        playing={false}
      />,
    );
    expect(html).toContain(`data-state="${state}"`);
    expect(html).toContain('aria-label="Exported buddy"');
    expect(html).toContain('width="128"');
  }
  const html = renderToStaticMarkup(
    <MyBuddy state="unknown" playing={false} />,
  );
  expect(html).toContain('data-state="idle"');
  expect(html).toContain('width="180"');
  expect(await readFile(path.join(dir, 'styles.css'), 'utf8')).toContain(
    'prefers-reduced-motion',
  );
});
it('rejects invalid component names before emitting executable code', () => {
  expect(() =>
    generateFiles(createConfig({ componentName: 'bad;alert(1)' })),
  ).toThrow(/Component name/);
});

it('the emitted animation module responds to reduced motion and cleans up', async () => {
  const config = createConfig();
  const dir = await mkdtemp(path.join(tmpdir(), 'wobbi-motion-contract-'));
  folders.push(dir);
  await writeFile(
    path.join(dir, 'animations.js'),
    generateFiles(config)['animations.js'],
  );
  const compiled = await build({
    entryPoints: [path.join(dir, 'animations.js')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
  });
  const module = { exports: {} };
  new Function('module', 'exports', compiled.outputFiles[0].text)(
    module,
    module.exports,
  );
  let onChange;
  const media = {
    matches: true,
    addEventListener: vi.fn((_, callback) => {
      onChange = callback;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('window', { matchMedia: () => media });
  const animation = { cancel: vi.fn(), play: vi.fn(), pause: vi.fn() };
  const animate = vi.fn(() => animation);
  const element = { querySelector: () => ({ animate }) };
  const dispose = module.exports.mountMotion(
    element,
    config.reactions.happy,
    config.accessibility,
    true,
  );
  expect(animate).not.toHaveBeenCalled();
  media.matches = false;
  onChange();
  expect(animate).toHaveBeenCalledTimes(4);
  dispose();
  expect(animation.cancel).toHaveBeenCalledTimes(4);
  expect(media.removeEventListener).toHaveBeenCalledWith('change', onChange);
});
