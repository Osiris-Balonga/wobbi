import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('wobbi.locale', 'fr'));
});
for (const view of ['creation', 'details', 'export', 'mobile']) {
  test(view, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    if (view === 'mobile')
      await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    if (view === 'details') {
      await page
        .getByRole('button', { name: 'Forme : Rond', exact: true })
        .click();
      await page.getByText('Apparence du corps', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Couleur du corps #ffcc45', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Bouche : Sourire', exact: true })
        .click();
      await page.getByRole('button', { name: /Accessoires & détails/ }).click();
      await page
        .getByRole('button', { name: /Voir \d+ détails de tête de plus/ })
        .click();
      await page
        .getByRole('button', {
          name: 'Tête : Oreilles de chat',
          exact: true,
        })
        .click();
      await page
        .getByRole('button', { name: 'Accessoires : Lunettes', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Accessoire', exact: true })
        .click();
    }
    if (view === 'export')
      await page.getByRole('button', { name: 'Exporter', exact: true }).click();
    await expect(page).toHaveScreenshot(view + '.png', {
      fullPage: view === 'mobile',
    });
  });
}
