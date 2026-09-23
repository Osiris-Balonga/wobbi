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
