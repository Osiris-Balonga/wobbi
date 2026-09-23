import { test, expect } from '@playwright/test';

test('switches the studio between English and French and remembers the choice', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { name: 'Make it yours.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Shape : Circle' }),
  ).toBeVisible();

  await page.getByRole('combobox', { name: 'Language' }).selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(
    page.getByRole('heading', { name: 'À vous de jouer.' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Forme : Rond' }),
  ).toBeVisible();
  await expect(page).toHaveTitle('Wobbi — Créez et animez votre mascotte');

  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Langue' })).toHaveValue(
    'fr',
  );
  await expect(
    page.getByRole('heading', { name: 'À vous de jouer.' }),
  ).toBeVisible();
});

for (const [locale, heading, shape, exportTitle] of [
  ['es', 'Hazlo tuyo.', 'Forma : Círculo', 'Exporta tu mascota'],
  ['pt-BR', 'Crie do seu jeito.', 'Forma : Círculo', 'Exporte seu mascote'],
  ['zh-Hans', '打造专属形象.', '形状 : 圆形', '导出吉祥物'],
]) {
  test(`${locale} covers the studio and export dialog on mobile`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.locator('.language-choice select').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.getByRole('button', { name: shape })).toBeVisible();
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      'content',
      {
        es: 'es_ES',
        'pt-BR': 'pt_BR',
        'zh-Hans': 'zh_CN',
      }[locale],
    );
    await page.locator('.export-button').click();
    await expect(
      page.getByRole('heading', { name: exportTitle }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
