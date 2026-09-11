import { describe, expect, it } from 'vitest';
import { svgAttributeName } from '../../packages/core/svg-attributes.js';

describe('SVG attribute names', () => {
  it('preserves case-sensitive geometry attributes', () => {
    expect(svgAttributeName('gradientUnits')).toBe('gradientUnits');
    expect(svgAttributeName('gradientTransform')).toBe('gradientTransform');
    expect(svgAttributeName('preserveAspectRatio')).toBe('preserveAspectRatio');
    expect(svgAttributeName('viewBox')).toBe('viewBox');
  });

  it('converts React presentation properties to SVG attributes', () => {
    expect(svgAttributeName('stopColor')).toBe('stop-color');
    expect(svgAttributeName('strokeLinecap')).toBe('stroke-linecap');
    expect(svgAttributeName('pointerEvents')).toBe('pointer-events');
  });
});
