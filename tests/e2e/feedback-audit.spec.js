import { test, expect } from '@playwright/test';
import { createConfig } from '../../packages/core/config.js';

const mascot = (page) => page.locator('.mascot-hit svg');
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wobbi.locale', 'fr'));
});

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
    mouth: 'none',
    head: 'round-ears',
    accessory: 'bandage',
  });

  await expect(
    page.getByRole('heading', { name: 'Nez, museau ou bec' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sourcils' })).toBeVisible();
  await page.getByRole('button', { name: /Accessoires & détails/ }).click();
  await expect(
    page.locator('#character-details .choice-section > h2'),
  ).toHaveText(['Tête', 'Accessoires', 'Couleurs des détails']);
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

test('authors the shared sleep, thought and song reactions', async ({
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
  await expect(
    page.getByRole('button', { name: /Réaction : Orage/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Réaction : Grande/ }),
  ).toHaveCount(0);
});

test('renders oval and egg as distinct tall silhouettes', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Voir 5 formes de plus', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Forme : Ovale', exact: true })
    .click();
  const ovalPath = await page
    .locator('.mascot-hit [data-shape="oval"]')
    .getAttribute('d');
  await page.getByRole('button', { name: 'Forme : Œuf', exact: true }).click();
  const bounds = await page
    .locator('.mascot-hit [data-shape="egg"]')
    .boundingBox();
  const eggPath = await page
    .locator('.mascot-hit [data-shape="egg"]')
    .getAttribute('d');
  expect(bounds.height).toBeGreaterThan(bounds.width * 1.2);
  expect(eggPath).not.toBe(ovalPath);
});

test('keeps the shape grid compact and collapses an extra selection', async ({
  page,
}) => {
  await page.goto('/');
  const shapeGrid = page.locator('.customizer > .choice-section').first();
  const tracks = await shapeGrid
    .locator(':scope > .choice-grid')
    .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' '));
  expect(tracks).toHaveLength(3);
  await expect(
    page.getByRole('button', { name: 'Forme : Triangle', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Voir 5 formes de plus', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Forme : Ovale', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Forme : Œuf', exact: true }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Voir 3 nez de plus', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Nez, museau ou bec : Museau',
      exact: true,
    })
    .click();
  const reduceNoses = page.getByRole('button', {
    name: 'Réduire nez, museau ou bec',
    exact: true,
  });
  await reduceNoses.click();
  await expect(
    page.getByRole('button', { name: 'Voir 3 nez de plus', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.getByRole('button', {
      name: 'Nez, museau ou bec : Museau',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('renders fitted Wobbi details, sunglasses and sideways thinking eyes', async ({
  page,
}, testInfo) => {
  await restore(page, {
    color: '#aa5d2b',
    depth: 'deep',
    nose: 'muzzle',
    head: 'round-ears',
    accessory: 'sunglasses',
  });
  await expect(
    mascot(page).locator('[data-accessory-style="sunglasses"]'),
  ).toBeVisible();
  const attached = await mascot(page).evaluate((svg) => {
    const body = svg.querySelector('[data-shape]');
    const leftEar = svg.querySelector('[data-part="round-ear-0"] ellipse');
    const rightEar = svg.querySelector('[data-part="round-ear-1"] ellipse');
    return [
      body.isPointInFill(
        new DOMPoint(
          Number(leftEar.getAttribute('cx')) + 14,
          Number(leftEar.getAttribute('cy')) + 7,
        ),
      ),
      body.isPointInFill(
        new DOMPoint(
          Number(rightEar.getAttribute('cx')) - 14,
          Number(rightEar.getAttribute('cy')) + 7,
        ),
      ),
    ];
  });
  expect(attached).toEqual([true, true]);
  await page
    .locator('.mascot-stage')
    .screenshot({ path: testInfo.outputPath('wobbi-sunglasses.png') });

  await page.getByRole('button', { name: 'Réaction : Réflexion' }).click();
  const pupilOffsets = await mascot(page).evaluate((svg) =>
    [...svg.querySelectorAll('[data-eye-wrap]')].map((eye) => {
      const white = eye.querySelector('[data-part="eye-white"]');
      const pupil = eye.querySelector('[data-part="pupil"] ellipse');
      return (
        Number(pupil.getAttribute('cy')) - Number(white.getAttribute('cy'))
      );
    }),
  );
  expect(pupilOffsets).toEqual([-8, -8]);
});

test('fits oval face accessories and excludes square ears', async ({
  page,
}) => {
  await restore(page, {
    shape: 'oval',
    color: '#ffcc45',
    accessory: 'blush',
  });
  const blushFits = await mascot(page).evaluate((svg) => {
    const body = svg.querySelector('[data-shape]').getBBox();
    return [...svg.querySelectorAll('[data-accessory-piece$="-blush"]')].every(
      (cheek) => {
        const box = cheek.getBBox();
        return box.x >= body.x && box.x + box.width <= body.x + body.width;
      },
    );
  });
  expect(blushFits).toBe(true);

  await page.getByRole('button', { name: /Accessoires & détails/ }).click();
  await page
    .getByRole('button', { name: 'Accessoires : Lunettes', exact: true })
    .click();
  await expect(
    mascot(page).locator('[data-accessory-piece="glasses-arms"]'),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Forme : Œuf', exact: true }).click();
  await expect(mascot(page).locator('[data-shape="egg"]')).toBeVisible();
  await expect(
    mascot(page).locator('[data-accessory-piece="glasses-arms"]'),
  ).toHaveCount(0);

  await page
    .getByRole('button', { name: 'Forme : Carré arrondi', exact: true })
    .click();
  await page
    .getByRole('button', { name: /Voir \d+ détails de tête de plus/ })
    .click();
  for (const label of [
    'Oreilles de lapin',
    'Oreilles de chat',
    'Oreilles rondes',
  ])
    await expect(
      page.getByRole('button', { name: `Tête : ${label}`, exact: true }),
    ).toHaveCount(0);
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

test('animates disclosure in both directions and keeps hidden controls inert', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', {
    name: 'Apparence du corps',
    exact: true,
  });
  const panel = page.locator('.body-settings .disclosure-motion');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveCSS('grid-template-rows', '0px');
  const openingHeights = await panel.evaluate(async (element) => {
    element.previousElementSibling.click();
    const samples = [];
    for (let frame = 0; frame < 20; frame += 1) {
      await new Promise(requestAnimationFrame);
      samples.push(Math.round(element.getBoundingClientRect().height));
    }
    return samples;
  });
  const openHeight = Math.max(...openingHeights);
  expect(new Set(openingHeights).size).toBeGreaterThan(3);
  expect(Math.min(...openingHeights)).toBeLessThan(openHeight);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).not.toHaveAttribute('inert', '');

  const closingHeights = await panel.evaluate(async (element) => {
    element.previousElementSibling.click();
    const samples = [];
    for (let frame = 0; frame < 20; frame += 1) {
      await new Promise(requestAnimationFrame);
      samples.push(Math.round(element.getBoundingClientRect().height));
    }
    return samples;
  });
  expect(new Set(closingHeights).size).toBeGreaterThan(3);
  expect(Math.max(...closingHeights)).toBeGreaterThan(0);
  expect(Math.min(...closingHeights)).toBeLessThan(openHeight);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toHaveCSS('grid-template-rows', '0px');
  await expect(panel).toHaveAttribute('inert', '');
});

test('keeps the studio focused and balanced on extra-large displays', async ({
  page,
}) => {
  for (const viewport of [
    { width: 2560, height: 1440 },
    { width: 3840, height: 2160 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const metrics = await page.evaluate(() => {
      const workspace = document.querySelector('.creation-workspace');
      const logo = document.querySelector('.brand-image');
      const mascot = document.querySelector('.mascot-hit .wobbi-mascot');
      const reactionTile = document.querySelector('.reaction-tile');
      const workspaceRect = workspace.getBoundingClientRect();

      return {
        documentWidth: document.documentElement.scrollWidth,
        workspaceLeft: workspaceRect.left,
        workspaceWidth: workspaceRect.width,
        logoLeft: logo.getBoundingClientRect().left,
        mascotWidth: mascot.getBoundingClientRect().width,
        reactionWidth: reactionTile.getBoundingClientRect().width,
      };
    });

    expect(metrics.documentWidth).toBe(viewport.width);
    expect(metrics.workspaceWidth).toBeLessThanOrEqual(2200);
    expect(metrics.logoLeft - metrics.workspaceLeft).toBeCloseTo(28, 0);
    expect(metrics.mascotWidth).toBeGreaterThanOrEqual(410);
    expect(metrics.mascotWidth).toBeLessThanOrEqual(520);
    expect(metrics.reactionWidth).toBeLessThanOrEqual(205);
  }
});
