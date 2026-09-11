// @vitest-environment node
import { it, expect, afterEach, vi } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  generateFiles,
  generateVueFiles,
} from '../../packages/codegen/node.js';
import { createConfig, REACTIONS } from '../../packages/core/config.js';

const require = createRequire(import.meta.url);
const folders = [];

afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(
    folders.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

async function writeFiles(prefix, files) {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  folders.push(dir);
  await Promise.all(
    Object.entries(files).map(([name, source]) =>
      writeFile(path.join(dir, name), source),
    ),
  );
  return dir;
}

it('exports every selected setting and renders deep volume in React', async () => {
  const config = createConfig({
    componentName: 'MyBuddy',
    size: 180,
    shape: 'egg',
    eyes: 'sleepy',
    nose: 'round',
    brows: 'worried',
    mouth: 'fangs',
    depth: 'deep',
    color: '#336699',
    mouthColor: '#102030',
    noseColor: '#f1b45f',
    browColor: '#20152d',
    pupilColor: '#0a0b0c',
    eyeColor: '#fefefe',
    eyeOutlineColor: '#554466',
    eyeOutlineWidth: 2,
    head: 'round-ears',
    accessory: 'freckles',
    accessoryColor: '#442255',
    accentColor: '#ffcc45',
    outlineColor: '#112233',
    outlineWidth: 4,
    background: { type: 'transparent', color: '#abcdef' },
    export: { framework: 'react' },
  });
  const files = generateFiles(config);
  expect(Object.keys(files)).toEqual([
    'MyBuddy.jsx',
    'MyBuddy.css',
    'preset.js',
    'render-model.js',
    'render-effects.js',
    'render.js',
    'motion.js',
    'index.js',
  ]);
  expect(files['MyBuddy.jsx']).toMatch(/^'use client'/);
  expect(files['MyBuddy.jsx']).not.toContain('function renderParts');
  expect(files['render.js']).toContain('function renderParts');
  expect(Object.values(files).join('\n')).not.toMatch(
    /localStorage|src\/studio|fetch\(/,
  );
  expect(Object.values(files).join('\n')).not.toMatch(/^\s*\/\/|\/\*/m);

  const dir = await writeFiles('wobbi-contract-', files);
  const generatedPreset = await import(
    `${pathToFileURL(path.join(dir, 'preset.js')).href}?test=${Date.now()}`
  );
  expect(generatedPreset.preset).toEqual(config);

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
    expect(html).toContain('data-part="body-depth"');
    expect(html).toContain('data-depth="deep"');
    expect(html).toContain('data-shape="egg"');
    expect(html).not.toMatch(/NaN|undefined/);
  }
  expect(await readFile(path.join(dir, 'MyBuddy.css'), 'utf8')).toContain(
    'prefers-reduced-motion',
  );
});

it('emits a focused Vue component with the same complete preset', async () => {
  const config = createConfig({
    componentName: 'VueBuddy',
    depth: 'deep',
    eyes: 'sleepy',
    export: { framework: 'vue' },
  });
  const files = generateVueFiles(config);
  expect(Object.keys(files)).toEqual([
    'VueBuddy.vue',
    'VueBuddy.css',
    'preset.js',
    'render-model.js',
    'render-effects.js',
    'render.js',
    'motion.js',
    'index.js',
  ]);
  expect(files['VueBuddy.vue']).toContain("from 'vue'");
  expect(files['VueBuddy.vue']).toContain('renderParts(');
  expect(files['index.js']).toContain(
    "export { default as VueBuddy } from './VueBuddy.vue'",
  );
  expect(Object.values(files).join('\n')).not.toMatch(/^\s*\/\/|\/\*/m);

  const script = files['VueBuddy.vue'].match(/<script>([\s\S]+)<\/script>/)[1];
  const compilable = { ...files, 'VueBuddy.js': script };
  delete compilable['VueBuddy.vue'];
  delete compilable['index.js'];
  const dir = await writeFiles('wobbi-vue-contract-', compilable);
  await expect(
    build({
      entryPoints: [path.join(dir, 'VueBuddy.js')],
      bundle: true,
      write: false,
      platform: 'browser',
      format: 'esm',
      external: ['vue'],
    }),
  ).resolves.toBeTruthy();
  const generatedPreset = await import(
    `${pathToFileURL(path.join(dir, 'preset.js')).href}?test=${Date.now()}`
  );
  expect(generatedPreset.preset).toEqual(config);
});

it('rejects invalid component names before emitting executable code', () => {
  expect(() =>
    generateFiles(createConfig({ componentName: 'bad;alert(1)' })),
  ).toThrow(/Component name/);
});

it('keeps the React component directly usable in client-rendered React and Next', () => {
  const component = generateFiles(
    createConfig({ export: { framework: 'react' } }),
  )['Wobbi.jsx'];
  expect(component).toMatch(/^'use client'/);
  expect(component).toContain("import './Wobbi.css'");
});

it('the emitted motion module responds to reduced motion and cleans up', async () => {
  const config = createConfig();
  const files = generateFiles(config);
  const dir = await writeFiles('wobbi-motion-contract-', {
    'motion.js': files['motion.js'],
  });
  const compiled = await build({
    entryPoints: [path.join(dir, 'motion.js')],
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
