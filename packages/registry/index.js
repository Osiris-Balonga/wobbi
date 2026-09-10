import { createConfig } from '../core/config.js';
export const PRESETS = [
  {
    slug: 'ghost-eye',
    label: 'Ghostie',
    shape: 'ghost',
    color: '#17171c',
    background: { color: '#9775fa' },
  },
  {
    slug: 'blinky',
    label: 'Blinky',
    shape: 'rounded-square',
    color: '#f03f52',
    outlineWidth: 0,
    background: { color: '#ffdbe2' },
  },
  {
    slug: 'dot',
    label: 'Dot',
    shape: 'blob',
    color: '#4999ef',
    outlineWidth: 0,
    background: { color: '#dbeeff' },
  },
  {
    slug: 'mochi',
    label: 'Mochi',
    shape: 'circle',
    color: '#ef77bb',
    eyes: 'dots',
    outlineWidth: 0,
    background: { color: '#ffe4f3' },
  },
  {
    slug: 'pixel',
    label: 'Pixel',
    shape: 'rounded-square',
    color: '#17171c',
    eyes: 'dots',
    outlineWidth: 0,
    background: { color: '#d9d4f5' },
  },
  {
    slug: 'orb',
    label: 'Orb',
    shape: 'circle',
    color: '#30b966',
    outlineWidth: 0,
    background: { color: '#d9f5e4' },
  },
];
export function resolveMascot(slug) {
  const preset = PRESETS.find((p) => p.slug === slug);
  if (!preset)
    throw new Error(
      `Mascot "${slug}" is not in the local registry. Available: ${PRESETS.map((p) => p.slug).join(', ')}.`,
    );
  const name = slug === 'ghost-eye' ? 'GhostEye' : preset.label;
  return createConfig({
    ...preset,
    id: `wobbi-${slug}`,
    preset: slug,
    name,
    componentName: name,
    accessibility: { label: `${name} mascot` },
  });
}
export const localRegistry = {
  list: () => PRESETS.map((p) => p.slug),
  resolve: resolveMascot,
};
