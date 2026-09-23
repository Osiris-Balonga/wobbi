// @vitest-environment node
import { expect, it } from 'vitest';
import { resolveLocale, translate } from '../../src/i18n/index.js';
import { catalog } from '../../src/studio/catalog.js';
import { createConfig } from '../../packages/core/config.js';
import { generateVanillaFiles } from '../../packages/codegen/node.js';

it('resolves regional preferences and falls back to English', () => {
  expect(resolveLocale(['de-DE', 'fr-CG'])).toBe('fr');
  expect(resolveLocale(['zh-Hans'])).toBe('en');
  expect(
    translate('fr', 'Show {count} more {item}', { count: 3, item: 'formes' }),
  ).toBe('Voir 3 formes de plus');
  expect(translate('fr', 'Untranslated key')).toBe('Untranslated key');
  expect(catalog('en').shapeLabels.circle).toBe('Circle');
  expect(catalog('fr').shapeLabels.circle).toBe('Rond');
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
});
