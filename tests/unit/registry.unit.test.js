import { describe, expect, it } from 'vitest';
import { PRESETS, resolveMascot } from '../../packages/registry/index.js';
import { validateConfig } from '../../packages/core/config.js';

describe('local registry', () => {
  it('contains only configurations accepted by the current contract', () => {
    for (const preset of PRESETS)
      expect(validateConfig(resolveMascot(preset.slug))).toEqual([]);
  });
});
