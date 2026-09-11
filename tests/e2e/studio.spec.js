import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { unzipSync, strFromU8 } from 'fflate';
const mascot = (page) => page.locator('.mascot-hit svg');
async function download(page, name) {
  const promise = page.waitForEvent('download');
  await page.getByRole('button', { name, exact: true }).click();
  const item = await promise;
  return {
    name: item.suggestedFilename(),
    bytes: await readFile(await item.path()),
  };
}
test('brand identity, live gaze, customization, undo, project round trip', async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.special-tag')).toHaveCount(0);
  await expect(
    page.getByRole('img', { name: 'Wobbi', exact: true }),
  ).toHaveAttribute('src', '/brand/wobbi-wordmark.png');
  await expect(mascot(page).locator('[data-shape]')).toHaveAttribute(
    'data-shape',
    'wobbi',
  );
  const body = mascot(page).locator('[data-part="body"]');
  const initial = await body.getAttribute('transform');
  await expect.poll(() => body.getAttribute('transform')).not.toBe(initial);
  await page.mouse.move(1200, 200);
  await page.waitForTimeout(300);
  const gaze = await mascot(page)
    .locator('[data-part="gaze"]')
    .getAttribute('transform');
  await page.mouse.move(500, 550);
  await expect
    .poll(() =>
      mascot(page).locator('[data-part="gaze"]').getAttribute('transform'),
    )
    .not.toBe(gaze);
  await page.getByRole('button', { name: 'Forme : Rond', exact: true }).click();
  await page
    .getByRole('button', { name: 'Voir 9 regards de plus', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Yeux : Points', exact: true })
    .click();
  await page.getByText('Apparence des yeux', { exact: true }).click();
  await page
    .getByRole('button', {
      name: 'Couleur des yeux #9270ff',
      exact: true,
    })
    .click();
  await expect(
    mascot(page).locator('[data-part="eyes"] ellipse').first(),
  ).toHaveAttribute('fill', '#9270ff');
  await page
    .getByRole('button', { name: 'Bouche : Sourire', exact: true })
    .click();
  await page.getByText('Teinte de la bouche', { exact: true }).click();
  await page
    .getByRole('button', {
      name: 'Couleur de la bouche #61a9ff',
      exact: true,
    })
    .click();
  await expect(
    mascot(page).locator('[data-part="mouth"] path'),
  ).toHaveAttribute('stroke', '#61a9ff');
  await page.getByText('Apparence du corps', { exact: true }).click();
  await page
    .getByRole('button', {
      name: 'Couleur du corps personnalisée',
      exact: true,
    })
    .click();
  await page.getByLabel('HEX', { exact: true }).fill('#ffcc45');
  await page.getByRole('button', { name: 'Terminé', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Yeux : Points', exact: true }),
  ).toHaveCSS('background-color', 'rgb(255, 204, 69)');
  await expect(
    page.getByRole('button', { name: 'Bouche : Sourire', exact: true }),
  ).toHaveCSS('background-color', 'rgb(255, 204, 69)');
  await expect(
    page.getByRole('button', { name: 'Bouche : Sourire', exact: true }),
  ).toHaveCSS('color', 'rgb(17, 18, 24)');
  await expect(
    page.getByRole('button', { name: 'Nez, museau ou bec : Petit nez' }),
  ).toHaveCSS('background-color', 'rgb(255, 204, 69)');
  await expect(page.getByRole('button', { name: 'Sourcils : Doux' })).toHaveCSS(
    'background-color',
    'rgb(255, 204, 69)',
  );
  const details = page.getByRole('button', { name: /Accessoires & détails/ });
  await details.click();
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('heading', { name: /À vous de jouer/ }),
  ).toBeVisible();
  await page
    .getByRole('button', {
      name: /Voir \d+ détails de tête de plus/,
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Tête : Oreilles de chat', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Accessoires : Lunettes', exact: true })
    .click();
  await expect(mascot(page).locator('[data-shape]')).toHaveAttribute(
    'fill',
    '#ffcc45',
  );
  await page
    .getByRole('button', { name: 'Réaction : Oreilles', exact: true })
    .click();
  await expect(mascot(page)).toHaveAttribute('data-state', 'special');
  await expect(mascot(page)).toHaveAttribute('data-state', 'idle', {
    timeout: 4000,
  });
  await page.getByLabel('Nom de la mascotte').fill('Petit Soleil');
  await page.getByRole('button', { name: 'Exporter', exact: true }).click();
  await page.getByRole('button', { name: /Projet Wobbi/ }).click();
  const project = await download(page, 'Enregistrer le projet');
  expect(project.name).toBe('petit-soleil.json');
  const config = JSON.parse(project.bytes);
  expect(config).toMatchObject({
    shape: 'circle',
    eyes: 'dots',
    eyeColor: '#9270ff',
    mouthColor: '#61a9ff',
    head: 'ears',
    accessory: 'glasses',
    color: '#ffcc45',
    version: 2,
  });
  await page.getByRole('button', { name: 'Fermer l’export' }).click();
  await page.getByRole('button', { name: 'Repartir de Wobbi' }).click();
  await page.getByLabel('Importer un projet Wobbi').setInputFiles({
    name: 'creation.json',
    mimeType: 'application/json',
    buffer: project.bytes,
  });
  await expect(page.getByLabel('Nom de la mascotte')).toHaveValue(
    'Petit Soleil',
  );
  await page.reload();
  await expect(mascot(page).locator('[data-shape]')).toHaveAttribute(
    'fill',
    '#ffcc45',
  );
  expect(errors).toEqual([]);
});
test('React download compiles and really animates in a separate page', async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.getByText('Apparence du corps', { exact: true }).click();
  await page.getByRole('button', { name: 'Profond', exact: true }).click();
  await expect(
    mascot(page).locator('[data-part="body-depth"]'),
  ).toHaveAttribute('data-depth', 'deep');
  await page.getByRole('button', { name: 'Exporter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Vue.js' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next.js' })).toHaveCount(0);
  await expect(
    page.locator('.code-file-tree button').first().locator('img'),
  ).toHaveAttribute('src', '/brand/react.svg');
  const item = await download(page, 'Télécharger les fichiers'),
    files = unzipSync(item.bytes);
  expect(Object.keys(files).sort()).toEqual([
    'Wobbi.css',
    'Wobbi.jsx',
    'index.js',
    'motion.js',
    'preset.js',
    'render-effects.js',
    'render-model.js',
    'render.js',
  ]);
  expect(strFromU8(files['preset.js'])).toContain('"depth": "deep"');
  const dir = await mkdtemp(path.join(tmpdir(), 'wobbi-react-'));
  try {
    for (const [name, bytes] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(dir, name)), { recursive: true });
      await writeFile(path.join(dir, name), bytes);
    }
    const harness = path.join(dir, 'harness.jsx');
    await writeFile(
      harness,
      `import { createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Wobbi } from './index.js';
function App() {
  const [state, setState] = useState('idle');
  window.setWobbiState = setState;
  return <Wobbi state={state} size={320} />;
}
createRoot(document.querySelector('#root')).render(<App />);`,
    );
    const result = await build({
      entryPoints: [harness],
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      loader: { '.css': 'empty' },
      nodePaths: [path.resolve('node_modules')],
    });
    const preview = await context.newPage();
    const errors = [];
    preview.on('pageerror', (e) => errors.push(e.message));
    await preview.setContent('<div id="root"></div>');
    await preview.addScriptTag({ content: result.outputFiles[0].text });
    const svg = preview.locator('svg');
    await expect(svg).toHaveAttribute('data-state', 'idle');
    await expect(svg.locator('[data-part="body-depth"]')).toHaveAttribute(
      'data-depth',
      'deep',
    );
    await expect(svg.locator('radialGradient stop').first()).toHaveAttribute(
      'stop-opacity',
      '0.42',
    );
    const first = await svg
      .locator('[data-part="body"]')
      .getAttribute('transform');
    await expect
      .poll(() => svg.locator('[data-part="body"]').getAttribute('transform'))
      .not.toBe(first);
    await preview.evaluate(() => window.setWobbiState('loading'));
    await expect(svg).toHaveAttribute('data-state', 'loading');
    await svg.click();
    await expect(svg).toHaveAttribute('data-state', 'happy');
    await expect(svg).toHaveAttribute('data-state', 'loading', {
      timeout: 4000,
    });
    expect(errors).toEqual([]);
    await preview.close();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('Vue export presents a focused component with typed file icons', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Exporter', exact: true }).click();
  await page.getByRole('button', { name: 'Vue.js', exact: true }).click();
  const vueFile = page
    .locator('.code-file-tree button')
    .filter({ hasText: 'Wobbi.vue' });
  await expect(vueFile.locator('img')).toHaveAttribute('src', '/brand/vue.svg');
  const cssFile = page
    .locator('.code-file-tree button')
    .filter({ hasText: 'Wobbi.css' });
  await expect(cssFile.locator('img')).toHaveAttribute('src', '/brand/css.svg');
  const item = await download(page, 'Télécharger les fichiers');
  const files = unzipSync(item.bytes);
  expect(Object.keys(files).sort()).toEqual([
    'Wobbi.css',
    'Wobbi.vue',
    'index.js',
    'motion.js',
    'preset.js',
    'render-effects.js',
    'render-model.js',
    'render.js',
  ]);
  expect(strFromU8(files['Wobbi.vue'])).toContain("from 'vue'");
});
test('vanilla download has a working state API, pointer response and disposal', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Exporter', exact: true }).click();
  await page.getByRole('button', { name: 'JavaScript', exact: true }).click();
  const item = await download(page, 'Télécharger les fichiers'),
    files = unzipSync(item.bytes);
  expect(Object.keys(files).sort()).toEqual([
    'README.md',
    'animations.js',
    'config.js',
    'index.html',
    'mascot.js',
    'preview.js',
    'renderer.js',
    'styles.css',
  ]);
  expect(strFromU8(files['index.html'])).toContain('data-state="special"');
  const dir = await mkdtemp(path.join(tmpdir(), 'wobbi-vanilla-'));
  for (const [name, bytes] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, name)), { recursive: true });
    await writeFile(path.join(dir, name), bytes);
  }
  const preview = await context.newPage();
  const errors = [];
  preview.on('pageerror', (event) => errors.push(event.message));
  await preview.goto(pathToFileURL(path.join(dir, 'index.html')).href);
  await expect(preview.locator('.preview-shell')).toHaveCSS('display', 'grid');
  await expect(preview.locator('.preview-stage')).toHaveCSS(
    'background-color',
    'rgb(241, 237, 255)',
  );
  await expect(preview.locator('.preview-stage')).toHaveCSS(
    'background-image',
    'none',
  );
  await expect(preview.locator('svg')).toHaveAttribute(
    'viewBox',
    '-16 -16 288 288',
  );
  await expect(preview.locator('[data-part="body-depth"]')).toHaveAttribute(
    'data-depth',
    'soft',
  );
  await preview.evaluate(() => window.mascot.setState('loading'));
  await expect(preview.locator('svg')).toHaveAttribute('data-state', 'loading');
  await preview.locator('svg').press('Enter');
  await expect(preview.locator('svg')).toHaveAttribute('data-state', 'happy');
  await expect(preview.locator('svg')).toHaveAttribute(
    'data-state',
    'loading',
    { timeout: 4000 },
  );
  await preview.evaluate(() => window.mascot.destroy());
  await expect(preview.locator('svg')).toHaveCount(0);
  expect(errors).toEqual([]);
  await preview.close();
  await rm(dir, { recursive: true, force: true });
});
test('exports decodable SVG, PNG, GIF and WebM without starting a download on open', async ({
  page,
}) => {
  test.setTimeout(90000);
  const downloads = [];
  page.on('download', (d) => downloads.push(d));
  await page.goto('/');
  await page.getByRole('button', { name: 'Exporter', exact: true }).click();
  expect(downloads).toHaveLength(0);
  await page
    .getByRole('button', { name: 'Image PNG ou SVG', exact: true })
    .click();
  await page.getByRole('button', { name: 'SVG', exact: true }).click();
  const svg = await download(page, 'Télécharger l’image');
  expect(svg.bytes.toString()).toContain('viewBox="-16 -16 288 288"');
  expect(
    await page.evaluate(
      (text) =>
        (() => {
          const document = new DOMParser().parseFromString(
            text,
            'image/svg+xml',
          );
          return {
            error: document.querySelector('parsererror')?.textContent || null,
            hasBackground: Boolean(
              document.documentElement.querySelector(':scope > rect'),
            ),
          };
        })(),
      svg.bytes.toString(),
    ),
  ).toEqual({ error: null, hasBackground: true });
  await page.getByRole('button', { name: 'PNG', exact: true }).click();
  const png = await download(page, 'Télécharger l’image');
  expect(png.bytes.subarray(1, 4).toString()).toBe('PNG');
  expect(png.bytes.readUInt32BE(16)).toBe(512);
  expect(
    await page.evaluate(async (bytes) => {
      const bitmap = await createImageBitmap(
        new Blob([new Uint8Array(bytes)], { type: 'image/png' }),
      );
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = bitmap.width;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return context.getImageData(0, 0, 1, 1).data[3];
    }, Array.from(png.bytes)),
  ).toBe(255);
  await page
    .getByRole('button', { name: 'Animation GIF ou vidéo', exact: true })
    .click();
  await page.getByLabel('Réaction à enregistrer').selectOption('happy');
  const gif = await download(page, 'Télécharger l’animation');
  expect(gif.bytes.subarray(0, 6).toString()).toBe('GIF89a');
  const gifResult = await page.evaluate(async (bytes) => {
    const decoder = new ImageDecoder({
      data: new Uint8Array(bytes),
      type: 'image/gif',
    });
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;
    const first = await decoder.decode({ frameIndex: 0 });
    const last = await decoder.decode({ frameIndex: track.frameCount - 1 });
    const count = track.frameCount;
    const canvas = document.createElement('canvas');
    canvas.width = first.image.displayWidth;
    canvas.height = first.image.displayHeight;
    const context = canvas.getContext('2d');
    context.drawImage(first.image, 0, 0);
    const alpha = context.getImageData(0, 0, 1, 1).data[3];
    first.image.close();
    last.image.close();
    decoder.close();
    return { count, alpha };
  }, Array.from(gif.bytes));
  expect(gifResult).toEqual({ count: 54, alpha: 255 });
  await page.getByRole('button', { name: 'Vidéo · WebM', exact: true }).click();
  const video = await download(page, 'Télécharger l’animation');
  expect(video.bytes.subarray(0, 4).toString('hex')).toBe('1a45dfa3');
  expect(
    await page.evaluate(async (bytes) => {
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes)], { type: 'video/webm' }),
      );
      const v = document.createElement('video');
      v.src = url;
      await new Promise((resolve, reject) => {
        v.onloadeddata = resolve;
        v.onerror = reject;
      });
      v.currentTime = 1;
      await new Promise((resolve, reject) => {
        v.onseeked = resolve;
        v.onerror = reject;
      });
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(v, 0, 0);
      const alpha = context.getImageData(0, 0, 1, 1).data[3];
      const width = v.videoWidth;
      v.removeAttribute('src');
      return { width, alpha };
    }, Array.from(video.bytes)),
  ).toEqual({ width: 256, alpha: 255 });
});
test('motion preference, pause and keyboard-accessible export with real contrast', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const body = mascot(page).locator('[data-part="body"]'),
    start = await body.getAttribute('transform');
  await page.waitForTimeout(250);
  expect(await body.getAttribute('transform')).toBe(start);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => body.getAttribute('transform')).not.toBe(start);
  await page.getByRole('button', { name: 'Mettre en pause' }).click();
  const paused = await body.getAttribute('transform');
  await page.waitForTimeout(250);
  expect(await body.getAttribute('transform')).toBe(paused);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByText('Apparence du corps', { exact: true }).click();
  await page
    .getByRole('button', {
      name: 'Couleur du corps personnalisée',
      exact: true,
    })
    .click();
  const hue = page.getByRole('slider', { name: 'Teinte' });
  await hue.focus();
  const initialHue = Number(await hue.inputValue());
  await page.keyboard.press('ArrowRight');
  expect(Number(await hue.inputValue())).toBe((initialHue + 1) % 360);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Terminé' }).click();
  const button = page.getByRole('button', { name: 'Exporter', exact: true });
  await button.click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(button).toBeFocused();
});
test('mobile layout stays within viewport and exposes accessories and export', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Forme : Rond', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.getByRole('button', { name: /Accessoires & détails/ }).click();
  await page
    .getByRole('button', { name: /Voir \d+ détails de tête de plus/ })
    .click();
  await page
    .getByRole('button', { name: 'Tête : Oreilles de chat', exact: true })
    .click();
  await page.getByRole('button', { name: 'Exporter', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('transform', 'none');
  const box = await dialog.boundingBox();
  expect(box.x).toBe(0);
  expect(box.width).toBe(390);
  expect(Math.round(box.y + box.height)).toBe(844);
  const footer = dialog.locator('.dialog-footer');
  const footerBefore = await footer.boundingBox();
  await dialog.locator('.dialog-body').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  expect(
    Math.abs((await footer.boundingBox()).y - footerBefore.y),
  ).toBeLessThan(0.5);
  await expect(
    dialog.getByRole('button', { name: 'Télécharger les fichiers' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
