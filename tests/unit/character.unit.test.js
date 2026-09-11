import { it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createConfig,
  EYES,
  SHAPES,
  REACTIONS,
  validateConfig,
} from '../../packages/core/config.js';
import { renderParts } from '../../packages/core/render.js';
import { sampleCharacter } from '../../packages/core/motion.js';
it('keeps distinct eye families through expressions across every body', () => {
  for (const shape of SHAPES)
    for (const state of REACTIONS) {
      const faces = EYES.slice(0, 5).map((eyes) =>
        renderToStaticMarkup(
          renderParts(createElement, createConfig({ shape, eyes }), state),
        ),
      );
      expect(
        new Set(faces.map((svg) => svg.replace(/data-eyes="[^"]*"/g, ''))).size,
      ).toBe(5);
      faces.forEach((svg) => {
        expect(svg).not.toMatch(/NaN|undefined/);
        expect(svg).toContain('data-shape="' + shape + '"');
      });
    }
});
it('keeps every eye family structurally coherent through every reaction', () => {
  for (const eyes of EYES)
    for (const state of [...REACTIONS, 'special']) {
      const markup = renderToStaticMarkup(
        renderParts(createElement, createConfig({ eyes }), state),
      );
      expect(markup).not.toMatch(/NaN|undefined/);
      expect((markup.match(/data-eye-wrap=/g) || []).length).toBe(2);
    }
});
it('adapts sleepy eyelids to reaction intent instead of stacking expressions', () => {
  const renderSleepy = (state) =>
    renderToStaticMarkup(
      renderParts(createElement, createConfig({ eyes: 'sleepy' }), state),
    );
  for (const state of ['idle', 'thinking', 'loading', 'singing', 'special'])
    expect(
      (renderSleepy(state).match(/data-eye-lid="sleepy"/g) || []).length,
    ).toBe(2);
  expect(renderSleepy('surprised')).not.toContain('data-eye-lid="sleepy"');
  expect(
    (renderSleepy('sad').match(/data-eye-lid="fearful"/g) || []).length,
  ).toBe(2);
  expect(
    (renderSleepy('error').match(/data-eye-lid="angry"/g) || []).length,
  ).toBe(2);
  expect(
    (renderSleepy('sleeping').match(/data-eye-lid="sleeping"/g) || []).length,
  ).toBe(2);
  for (const state of ['happy', 'success'])
    expect(renderSleepy(state)).not.toContain('data-eye-lid="sleepy"');
});
it('opens both wink eyes for surprise so neither eye becomes empty', () => {
  const markup = renderToStaticMarkup(
    renderParts(createElement, createConfig({ eyes: 'wink' }), 'surprised'),
  );
  expect((markup.match(/data-part="pupil"/g) || []).length).toBe(2);
  expect((markup.match(/data-part="eye-white"/g) || []).length).toBe(2);
});
it('never invents an absent mouth, nose or eyebrows for a reaction', () => {
  const config = createConfig({ nose: 'none', brows: 'none', mouth: 'none' });
  for (const state of [...REACTIONS, 'special']) {
    const markup = renderToStaticMarkup(
      renderParts(createElement, config, state),
    );
    expect(markup).not.toContain('data-part="mouth"');
    expect(markup).not.toContain('data-part="nose"');
    expect(markup).not.toContain('data-part="brows"');
  }
});
it('authors a short complete blink and settles a jump back to rest', () => {
  const c = createConfig();
  expect(sampleCharacter(c, 'idle', 2.89).blink).toBeLessThan(0.05);
  expect(sampleCharacter(c, 'idle', 3.05).blink).toBe(1);
  expect(sampleCharacter(c, 'happy', 0.19).sy).toBeLessThan(1);
  expect(sampleCharacter(c, 'happy', 0.69).y).toBeLessThan(-20);
  expect(sampleCharacter(c, 'happy', 1.6)).toMatchObject({
    x: 0,
    y: 0,
    sx: 1,
    sy: 1,
    rotate: 0,
  });
});
it('provides shape-specific motion without turning waiting into sleep', () => {
  const ghost = sampleCharacter(createConfig({ shape: 'ghost' }), 'special', 1);
  const oval = sampleCharacter(createConfig({ shape: 'oval' }), 'special', 1);
  expect(ghost.opacity).toBeLessThan(0.4);
  expect(oval.y).toBeLessThan(-5);
  const wait = renderToStaticMarkup(
    renderParts(createElement, createConfig(), 'loading'),
  );
  expect((wait.match(/data-eye="/g) || []).length).toBe(2);
  expect(wait).toContain('data-wait-dot="2"');
});
it('renders the new facial details and authored reaction effects', () => {
  const detailed = renderToStaticMarkup(
    renderParts(
      createElement,
      createConfig({
        eyes: 'money',
        brows: 'arched',
        nose: 'muzzle',
        mouth: 'tooth',
      }),
      'idle',
    ),
  );
  expect(detailed).toContain('data-eye-symbol="money"');
  expect(detailed).toContain('data-part="brows"');
  expect(detailed).toContain('data-part="nose"');
  expect((detailed.match(/<rect/g) || []).length).toBeGreaterThanOrEqual(2);

  for (const [state, effect] of [
    ['thinking', 'idea'],
    ['sleeping', 'sleep'],
    ['singing', 'singing'],
  ]) {
    const markup = renderToStaticMarkup(
      renderParts(createElement, createConfig(), state),
    );
    expect(markup).toContain(`data-effect="${effect}"`);
  }
  expect(
    renderToStaticMarkup(
      renderParts(createElement, createConfig({ shape: 'cloud' }), 'special'),
    ),
  ).toContain('data-effect="storm"');
  expect(
    renderToStaticMarkup(
      renderParts(createElement, createConfig({ shape: 'drop' }), 'special'),
    ),
  ).toContain('data-effect="splash"');
});
it('rejects retired eye identifiers instead of silently changing the design', () => {
  expect(validateConfig(createConfig({ eyes: 'stars' }))).toContain(
    'Choose supported eyes.',
  );
});
