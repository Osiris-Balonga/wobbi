import { test, expect } from '@playwright/test';
import { createConfig } from '../../packages/core/config.js';

const mascot = (page) => page.locator('.mascot-hit svg');

async function restore(page, config) {
  await page.addInitScript((storedConfig) => {
    localStorage.setItem(
      'wobbi.studio.v2',
      JSON.stringify({ config: storedConfig }),
    );
  }, createConfig(config));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}

test('keeps gaze inside preview and exposes the richer face controls', async ({
  page,
}, testInfo) => {
  await restore(page, {
    shape: 'circle',
    color: '#ffcc45',
    depth: 'deep',
    eyes: 'glossy',
    brows: 'arched',
    nose: 'muzzle',
    mouth: 'tooth',
    head: 'round-ears',
    accessory: 'bandage',
  });

  await expect(
    page.getByRole('heading', { name: 'Nez, museau ou bec' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sourcils' })).toBeVisible();
  await page.getByRole('button', { name: /Accessoires & détails/ }).click();
  await expect(
    page.locator('#character-details .choice-grid.columns-3'),
  ).toHaveCount(2);
  await page
    .locator('.mascot-stage')
    .screenshot({ path: testInfo.outputPath('detailed-face.png') });

  const preview = page.locator('.mascot-stage');
  const box = await preview.boundingBox();
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
  await expect
    .poll(async () => {
      const transform = await mascot(page)
        .locator('[data-part="gaze"]')
        .getAttribute('transform');
      return Number(transform.match(/translate\(([-\d.]+)/)?.[1] || 0);
    })
    .toBeGreaterThan(2);
  await page.mouse.move(40, 300);
  await expect
    .poll(async () => {
      const transform = await mascot(page)
        .locator('[data-part="gaze"]')
        .getAttribute('transform');
      return Math.abs(
        Number(transform.match(/translate\(([-\d.]+)/)?.[1] || 0),
      );
    })
    .toBeLessThan(1);
});

test('authors sleep, thought, song, splash and storm reactions', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await restore(page, {
    shape: 'cloud',
    color: '#61a9ff',
    depth: 'soft',
    eyes: 'classic',
    mouth: 'smile',
  });

  await page.getByRole('button', { name: 'Réaction : Réflexion' }).click();
  await expect(mascot(page).locator('[data-effect="idea"]')).toBeVisible();
  await expect(mascot(page).locator('[data-idea-bulb]')).toHaveText('💡');
  await expect(mascot(page).locator('[data-eye-lid="thinking"]')).toHaveCount(
    0,
  );
  await page
    .locator('.mascot-stage')
    .screenshot({ path: testInfo.outputPath('thinking.png') });

  await page.getByRole('button', { name: 'Réaction : Sommeil' }).click();
  await expect(mascot(page).locator('[data-sleep-z]')).toHaveCount(3);

  await page.getByRole('button', { name: 'Tout voir' }).click();
  await page.getByRole('button', { name: 'Réaction : Chant' }).click();
  await expect(mascot(page).locator('[data-effect="singing"]')).toBeVisible();

  await page.getByRole('button', { name: 'Réaction : Orage !' }).click();
  await expect(mascot(page).locator('[data-effect="storm"]')).toBeVisible();
  await page
    .locator('.mascot-stage')
    .screenshot({ path: testInfo.outputPath('cloud-storm.png') });

  await page.getByRole('button', { name: 'Forme : Goutte' }).click();
  await page
    .getByRole('button', { name: 'Réaction : Grande éclaboussure' })
    .click();
  await expect(mascot(page).locator('[data-effect="splash"]')).toBeVisible();
  await page
    .locator('.mascot-stage')
    .screenshot({ path: testInfo.outputPath('drop-splash.png') });
});

test('renders the oval as a taller, narrower mascot silhouette', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Voir 4 formes de plus', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Forme : Ovale', exact: true })
    .click();
  const bounds = await page
    .locator('.mascot-hit [data-shape="oval"]')
    .boundingBox();
  expect(bounds.height).toBeGreaterThan(bounds.width * 1.2);
});

test('reactions preserve intentionally absent facial features', async ({
  page,
}) => {
  await restore(page, {
    shape: 'circle',
    eyes: 'sleepy',
    nose: 'none',
    brows: 'none',
    mouth: 'none',
  });
  await page.getByRole('button', { name: 'Réaction : Réflexion' }).click();
  await expect(mascot(page).locator('[data-part="brows"]')).toHaveCount(0);
  await expect(mascot(page).locator('[data-part="mouth"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Réaction : Surprise' }).click();
  await expect(mascot(page).locator('[data-part="mouth"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Tout voir' }).click();
  await page.getByRole('button', { name: 'Réaction : Chant' }).click();
  await expect(mascot(page).locator('[data-part="mouth"]')).toHaveCount(0);
});
