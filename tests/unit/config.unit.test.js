import { describe, it, expect } from 'vitest';
import {
  createConfig,
  validateConfig,
  normalizeSlug,
  resolveState,
  REACTIONS,
  normalizeMotion,
  animationPlan,
  ACCESSORIES,
  accessoriesForShape,
  DEPTHS,
  EYES,
  NOSES,
  BROWS,
  headsForShape,
  MOUTHS,
  SHAPES,
} from '../../packages/core/config.js';
describe('mascot domain', () => {
  it('creates independent complete defaults', () => {
    const a = createConfig();
    const b = createConfig();
    expect(a).toMatchObject({
      slug: 'wobbi',
      name: 'Wobbi',
      componentName: 'Wobbi',
      shape: 'wobbi',
      mouthColor: '#111218',
      depth: 'soft',
      size: 256,
      defaultState: 'idle',
    });
    expect(a.accessibility.respectReducedMotion).toBe(true);
    expect(a).not.toHaveProperty('hands');
    expect(createConfig({ hands: true })).not.toHaveProperty('hands');
    a.reactions.happy.duration = 1300;
    expect(b.reactions.happy.duration).toBe(800);
  });
  it('normalizes human names and rejects unusable configurations', () => {
    expect(normalizeSlug('  Héllo Buddy! ')).toBe('hello-buddy');
    expect(
      validateConfig({ ...createConfig(), componentName: '1-bad' }),
    ).toContain(
      'Component name must be a valid PascalCase JavaScript identifier.',
    );
    expect(
      validateConfig({
        ...createConfig(),
        color: 'url(evil)',
        mouthColor: 'not-a-colour',
        size: 0,
        shape: 'human',
      }).length,
    ).toBeGreaterThanOrEqual(3);
    expect(validateConfig(createConfig())).toEqual([]);
    expect(
      validateConfig({
        ...createConfig(),
        export: { ...createConfig().export, framework: 'next' },
      }),
    ).toContain('Choose React or Vue.js.');
    expect(
      validateConfig(createConfig({ export: { framework: 'vue' } })),
    ).toEqual([]);
  });
  it('provides ten authored reactions with safe fallback', () => {
    expect(REACTIONS).toEqual([
      'idle',
      'happy',
      'thinking',
      'surprised',
      'sad',
      'error',
      'success',
      'loading',
      'sleeping',
      'singing',
    ]);
    expect(resolveState('bogus')).toBe('idle');
    expect(resolveState('happy')).toBe('happy');
  });
  it('keeps only approved silhouettes and rejects incompatible details', () => {
    expect(SHAPES).not.toContain('bean');
    expect(SHAPES).not.toContain('blob');
    expect(SHAPES).not.toContain('flame');
    expect(SHAPES).toContain('oval');
    expect(headsForShape('drop')).not.toContain('ears');
    expect(headsForShape('oval')).toEqual(
      expect.arrayContaining(['curl', 'bunny-ears']),
    );
    expect(headsForShape('triangle')).toEqual(['none', 'halo']);
    expect(accessoriesForShape('triangle')).not.toContain('hat');
    expect(accessoriesForShape('cloud')).not.toContain('hat');
    expect(ACCESSORIES).not.toEqual(expect.arrayContaining(['hat', 'cap']));
    expect(
      validateConfig(
        createConfig({ shape: 'triangle', head: 'ears', accessory: 'hat' }),
      ),
    ).toEqual([
      'Invalid accessory.',
      'Choose a head detail compatible with the shape.',
      'Choose an accessory compatible with the shape.',
    ]);
    expect(validateConfig(createConfig({ shape: 'flame' }))).toContain(
      'Choose a supported shape.',
    );
    expect(
      validateConfig({
        ...createConfig({ shape: 'circle' }),
        shape: 'triangle',
        head: 'ears',
        accessory: 'hat',
      }),
    ).toEqual([
      'Invalid accessory.',
      'Choose a head detail compatible with the shape.',
      'Choose an accessory compatible with the shape.',
    ]);
  });
  it('offers a broader but validated expression system', () => {
    expect(EYES).toHaveLength(12);
    expect(EYES).toEqual(
      expect.arrayContaining(['glossy', 'side-eye', 'wink', 'money']),
    );
    expect(EYES).not.toContain('stars');
    expect(NOSES).toEqual([
      'none',
      'dot',
      'round',
      'muzzle',
      'moustache',
      'beak',
    ]);
    expect(BROWS).toEqual(['none', 'soft', 'straight', 'arched', 'worried']);
    expect(MOUTHS).toHaveLength(8);
    expect(MOUTHS).toEqual(expect.arrayContaining(['grin', 'pout', 'fangs']));
    expect(MOUTHS).not.toContain('moustache');
    expect(validateConfig(createConfig({ mouth: 'moustache' }))).toContain(
      'Choose a supported mouth.',
    );
    expect(
      validateConfig(createConfig({ nose: 'beak', mouth: 'grin' })),
    ).toContain('A beak cannot be combined with a mouth.');
    expect(MOUTHS).not.toContain('kiss');
    expect(validateConfig(createConfig({ mouth: 'kiss' }))).toContain(
      'Choose a supported mouth.',
    );
    expect(DEPTHS).toEqual(['flat', 'soft', 'deep']);
    expect(validateConfig({ ...createConfig(), depth: 'plastic' })).toContain(
      'Choose supported depth.',
    );
  });
  it('clamps timing and strength and preserves ordered enabled moves', () => {
    const motion = normalizeMotion({
      duration: 5,
      intensity: 999,
      easing: 'bad',
      playback: 'bad',
      movements: [
        { type: 'tilt', enabled: true },
        { type: 'shake', enabled: false },
        { type: 'bounce', enabled: true },
      ],
    });
    expect(motion).toMatchObject({
      duration: 200,
      intensity: 100,
      easing: 'ease-out',
      playback: 'loop',
    });
    const plan = animationPlan(motion);
    expect(plan.map((x) => x.type)).toEqual(['tilt', 'bounce']);
    expect(plan[1].options.delay).toBe(100);
    expect(animationPlan(motion, true)).toEqual([]);
    expect(normalizeMotion({ duration: 999999, intensity: -2 })).toMatchObject({
      duration: 5000,
      intensity: 0,
    });
  });
});
