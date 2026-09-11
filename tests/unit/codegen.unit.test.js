// @vitest-environment node
import { it, expect } from 'vitest';
import {
  generateFiles,
  generateVanillaFiles,
  generateVueFiles,
} from '../../packages/codegen/node.js';
import { createConfig } from '../../packages/core/config.js';

it('reflects the complete editable configuration in focused React files', () => {
  const config = createConfig({
    componentName: 'CloudBuddy',
    color: '#336699',
    depth: 'deep',
  });
  const files = generateFiles(config);
  expect(files['preset.js']).toContain('#336699');
  expect(files['preset.js']).toContain('"depth": "deep"');
  expect(files['CloudBuddy.jsx']).not.toContain('function renderParts');
  expect(files['render.js']).toContain('function renderParts');
  expect(files['index.js']).toContain(
    "export { CloudBuddy } from './CloudBuddy.jsx'",
  );
  expect(files['motion.js']).toContain('function mountCharacter');
  expect(Object.keys(files)).toHaveLength(8);
});

it('provides separate Vue and standalone JavaScript deliveries', () => {
  const config = createConfig({ depth: 'deep' });
  const vueConfig = createConfig({
    depth: 'deep',
    export: { framework: 'vue' },
  });
  expect(generateVueFiles(vueConfig)).toHaveProperty('Wobbi.vue');
  const vanilla = generateVanillaFiles(config);
  expect(vanilla['config.js']).toContain('"depth": "deep"');
  expect(vanilla['renderer.js']).toContain('data-depth');
  expect(Object.values(vanilla).join('\n')).not.toMatch(/^\s*\/\/|\/\*/m);
});

it('uses the project background in previews and escapes document titles', () => {
  const config = createConfig({
    name: '</title><script>alert(1)</script>',
    background: { type: 'solid', color: '#aabbcc' },
  });
  const vanilla = generateVanillaFiles(config);
  expect(vanilla['index.html']).toContain(
    '&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;',
  );
  expect(vanilla['index.html']).not.toContain('</title><script>alert(1)');
  expect(vanilla['styles.css']).not.toMatch(
    /checker|repeating-conic-gradient/i,
  );
  expect(vanilla['preview.js']).toContain(
    "preset.background.type === 'transparent'",
  );
});
