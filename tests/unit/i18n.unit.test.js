// @vitest-environment node
import { expect, it } from 'vitest';
import {
  formatChoiceCount,
  messageCatalogs,
  resolveLocale,
  translate,
} from '../../src/i18n/index.js';
import { catalog } from '../../src/studio/catalog.js';
import { createConfig } from '../../packages/core/config.js';
import { generateVanillaFiles } from '../../packages/codegen/node.js';

it('resolves regional preferences and falls back to English', () => {
  expect(resolveLocale(['de-DE', 'fr-CG'])).toBe('fr');
  expect(resolveLocale(['zh-Hans'])).toBe('zh-Hans');
  expect(resolveLocale(['zh-TW', 'es-MX'])).toBe('es');
  expect(resolveLocale(['pt-PT'])).toBe('pt-BR');
  expect(resolveLocale(['de-DE'])).toBe('en');
  expect(
    translate('fr', 'Show {count} more {item}', { count: 3, item: 'formes' }),
  ).toBe('Voir 3 formes de plus');
  expect(translate('fr', 'Untranslated key')).toBe('Untranslated key');
  expect(catalog('en').shapeLabels.circle).toBe('Circle');
  expect(catalog('fr').shapeLabels.circle).toBe('Rond');
});

it('keeps translation keys complete and uses the right plural form', () => {
  const keys = Object.keys(messageCatalogs.fr).sort();
  for (const locale of ['es', 'pt-BR', 'zh-Hans']) {
    expect(Object.keys(messageCatalogs[locale]).sort()).toEqual(keys);
    for (const [group, labels] of Object.entries(catalog('en'))) {
      expect(Object.keys(catalog(locale)[group]).sort()).toEqual(
        Object.keys(labels).sort(),
      );
    }
  }
  const labels = { one: 'forma', other: 'formas' };
  expect(formatChoiceCount('es', 1, labels)).toBe('Ver 1 forma más');
  expect(formatChoiceCount('es', 2, labels)).toBe('Ver 2 formas más');
  expect(formatChoiceCount('pt-BR', 1, { one: 'forma', other: 'formas' })).toBe(
    'Ver mais 1 forma',
  );
  expect(formatChoiceCount('fr', 1, { one: 'forme', other: 'formes' })).toBe(
    'Voir 1 forme de plus',
  );
});

it('generates a preview in the selected language with English documentation', () => {
  const config = createConfig();
  const english = generateVanillaFiles(config, 'en');
  const french = generateVanillaFiles(config, 'fr');
  expect(english['index.html']).toContain('<html lang="en">');
  expect(english['index.html']).toContain('Try every reaction.');
  expect(french['index.html']).toContain('<html lang="fr">');
  expect(french['index.html']).toContain('Testez toutes les réactions.');
  expect(french['README.md']).toContain('Open `index.html` directly');
  for (const locale of ['es', 'pt-BR', 'zh-Hans']) {
    const files = generateVanillaFiles(config, locale);
    expect(files['index.html']).toContain(`<html lang="${locale}">`);
    expect(files['README.md']).toContain('Open `index.html` directly');
  }
});
