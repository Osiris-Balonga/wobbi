import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Mascot } from '../../src/mascot/Mascot.jsx';
import {
  accessoriesForShape,
  createConfig,
  EYES,
  headsForShape,
  MOUTHS,
  REACTIONS,
  SHAPES,
} from '../../packages/core/config.js';
it('renders every expression without losing shape and exposes accessible props', () => {
  const config = createConfig();
  const { rerender } = render(
    <Mascot config={config} state="idle" size={128} aria-label="My buddy" />,
  );
  for (const state of REACTIONS) {
    rerender(
      <Mascot config={config} state={state} size={128} aria-label="My buddy" />,
    );
    expect(screen.getByRole('img', { name: 'My buddy' })).toHaveAttribute(
      'data-state',
      state,
    );
    expect(screen.getByRole('img')).toHaveAttribute('width', '128');
    expect(document.querySelector('[data-shape]')).toHaveAttribute(
      'fill',
      config.color,
    );
  }
  rerender(<Mascot config={config} state="unknown" />);
  expect(screen.getByRole('img')).toHaveAttribute('data-state', 'idle');
});
it('changes geometry, eyes and mouth from the configuration', () => {
  const { rerender } = render(
    <Mascot
      config={createConfig({ shape: 'circle', eyes: 'dots', mouth: 'smile' })}
      playing={false}
    />,
  );
  expect(document.querySelector('[data-shape]')).toHaveAttribute(
    'data-shape',
    'circle',
  );
  expect(document.querySelector('[data-part="eyes"]')).toHaveAttribute(
    'data-eyes',
    'dots',
  );
  expect(document.querySelector('[data-part="mouth"]')).toBeInTheDocument();
  rerender(<Mascot config={createConfig({ mouth: 'none' })} playing={false} />);
  expect(document.querySelector('[data-part="mouth"]')).not.toBeInTheDocument();
});
it('uses an independent mouth colour', () => {
  render(
    <Mascot
      config={createConfig({
        mouth: 'smile',
        mouthColor: '#71d5a2',
        pupilColor: '#111218',
      })}
      playing={false}
    />,
  );
  expect(document.querySelector('[data-part="mouth"] path')).toHaveAttribute(
    'stroke',
    '#71d5a2',
  );
  expect(document.querySelector('[data-part="pupil"] ellipse')).toHaveAttribute(
    'fill',
    '#111218',
  );
});
it('renders every eye and mouth family with its real final geometry', () => {
  const { rerender } = render(
    <Mascot config={createConfig()} playing={false} />,
  );
  for (const eyes of EYES) {
    rerender(
      <Mascot config={createConfig({ eyes, depth: 'deep' })} playing={false} />,
    );
    expect(document.querySelector('[data-part="eyes"]')).toHaveAttribute(
      'data-eyes',
      eyes,
    );
    expect(document.querySelector('svg').innerHTML).not.toContain('NaN');
  }
  for (const mouth of MOUTHS) {
    rerender(<Mascot config={createConfig({ mouth })} playing={false} />);
    expect(Boolean(document.querySelector('[data-part="mouth"]'))).toBe(
      mouth !== 'none',
    );
  }
});
it('carries body depth onto compatible head details and solid accessories', () => {
  render(
    <Mascot
      config={createConfig({
        shape: 'circle',
        head: 'ears',
        accessory: 'headphones',
        depth: 'deep',
      })}
      playing={false}
    />,
  );
  expect(document.querySelector('[data-part="accessory-back"]')).toBeTruthy();
  expect(document.querySelector('[data-part="body-depth"]')).toBeTruthy();
  expect(document.querySelector('[data-detail-depth="ear-0"]')).toBeTruthy();
  expect(
    document.querySelector('[data-detail-depth="left-earcup"]'),
  ).toBeTruthy();
});
it('renders every allowed detail without invalid geometry', () => {
  const { rerender } = render(
    <Mascot config={createConfig()} playing={false} />,
  );
  for (const shape of SHAPES) {
    for (const head of headsForShape(shape)) {
      rerender(
        <Mascot config={createConfig({ shape, head })} playing={false} />,
      );
      expect(document.querySelector('[data-part="head"]')).toHaveAttribute(
        'data-fit-shape',
        shape,
      );
      expect(document.querySelector('svg').innerHTML).not.toContain('NaN');
    }
    for (const accessory of accessoriesForShape(shape)) {
      rerender(
        <Mascot config={createConfig({ shape, accessory })} playing={false} />,
      );
      expect(document.querySelector('[data-part="accessory"]')).toHaveAttribute(
        'data-fit-shape',
        shape,
      );
      expect(document.querySelector('svg').innerHTML).not.toContain('NaN');
    }
  }
});
it('keeps incompatible details out of valid render configurations', () => {
  const config = createConfig({
    shape: 'triangle',
    head: 'none',
    accessory: 'none',
  });
  expect(config).toMatchObject({ head: 'none', accessory: 'none' });
  render(<Mascot config={config} playing={false} />);
  expect(document.querySelector('[data-part="ear-0"]')).not.toBeInTheDocument();
  expect(
    document.querySelector('[data-accessory-piece="left-earcup"]'),
  ).not.toBeInTheDocument();
  expect(document.querySelector('[data-part="hands"]')).not.toBeInTheDocument();
});
it('uses body contrast for closed eyes and keeps pupilled eyes clean', () => {
  const { rerender } = render(
    <Mascot
      config={createConfig({ color: '#ffffff', eyeColor: '#ffffff' })}
      state="happy"
      playing={false}
    />,
  );
  expect(document.querySelector('[data-eye] path')).toHaveAttribute(
    'stroke',
    '#111218',
  );
  rerender(
    <Mascot
      config={createConfig({ color: '#111218', eyeColor: '#ffffff' })}
      state="happy"
      playing={false}
    />,
  );
  expect(document.querySelector('[data-eye] path')).toHaveAttribute(
    'stroke',
    '#ffffff',
  );
  rerender(
    <Mascot
      config={createConfig({ eyes: 'classic', depth: 'deep' })}
      playing={false}
    />,
  );
  expect(document.querySelector('[data-eye-depth]')).not.toBeInTheDocument();
});
it('renders the moustache, restrained fangs and a single Wobbi silhouette', () => {
  const { rerender } = render(
    <Mascot config={createConfig({ nose: 'moustache' })} playing={false} />,
  );
  expect(document.querySelector('[data-nose-style="moustache"]')).toBeTruthy();
  expect(document.querySelector('[data-shape="wobbi"]')).toBeTruthy();
  expect(
    document.querySelector('[transform="translate(-22 -19) scale(.96)"]'),
  ).toBeNull();
  rerender(
    <Mascot config={createConfig({ mouth: 'fangs' })} playing={false} />,
  );
  expect(
    document.querySelector('[data-mouth-style="closed-fangs"]'),
  ).toBeTruthy();
});
it('keeps a beak static and never renders a second mouth for reactions', () => {
  const { rerender } = render(
    <Mascot
      config={createConfig({ nose: 'beak', mouth: 'none' })}
      state="surprised"
      playing={false}
    />,
  );
  expect(document.querySelector('[data-part="nose"]')).toBeTruthy();
  expect(document.querySelector('[data-part="mouth"]')).toBeNull();
  expect(document.querySelector('[data-beak-expression]')).toBeNull();
  rerender(
    <Mascot
      config={createConfig({ nose: 'beak', mouth: 'none' })}
      state="singing"
      playing={false}
    />,
  );
  expect(document.querySelector('[data-part="mouth"]')).toBeNull();
});
it('does not start motion when paused or reduced motion is requested', () => {
  window.matchMedia = vi.fn(() => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(<Mascot config={createConfig()} state="happy" />);
  expect(Element.prototype.animate).not.toHaveBeenCalled();
});
