export const REACTIONS = [
  'idle',
  'happy',
  'thinking',
  'surprised',
  'sad',
  'error',
  'success',
  'loading',
];
export const SHAPES = ['ghost', 'circle', 'rounded-square', 'blob', 'triangle'];
export const EYES = ['classic', 'sleepy', 'dots', 'angry'];
export const MOVEMENTS = [
  'bounce',
  'squash',
  'tilt',
  'shake',
  'blink',
  'eye-movement',
  'mouth',
];
export const EASINGS = [
  'ease-out',
  'ease-in-out',
  'linear',
  'cubic-bezier(0.34,1.56,0.64,1)',
];
export const resolveState = (state) =>
  REACTIONS.includes(state) ? state : 'idle';
export function normalizeSlug(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}
export function normalizeMotion(value = {}) {
  const clamp = (n, min, max, fallback) =>
    Number.isFinite(Number(n))
      ? Math.min(max, Math.max(min, Number(n)))
      : fallback;
  return {
    duration: clamp(value.duration, 200, 5000, 800),
    intensity: clamp(value.intensity, 0, 100, 60),
    easing: EASINGS.includes(value.easing) ? value.easing : 'ease-out',
    playback: value.playback === 'once' ? 'once' : 'loop',
    movements: (value.movements || [])
      .filter(
        (m, i, a) =>
          MOVEMENTS.includes(m.type) &&
          a.findIndex((x) => x.type === m.type) === i,
      )
      .map((m) => ({ type: m.type, enabled: !!m.enabled })),
  };
}
export function createConfig(overrides = {}) {
  const moves = {
    idle: ['blink', 'eye-movement'],
    happy: ['bounce', 'squash', 'tilt', 'blink'],
    thinking: ['tilt', 'eye-movement'],
    surprised: ['squash', 'blink'],
    sad: ['tilt'],
    error: ['shake'],
    success: ['bounce', 'squash'],
    loading: ['tilt', 'blink'],
  };
  const defaults = {
    version: 1,
    id: 'wobbi-ghost-eye',
    slug: 'ghost-eye',
    name: 'GhostEye',
    componentName: 'GhostEye',
    preset: 'ghost-eye',
    shape: 'ghost',
    eyes: 'classic',
    mouth: 'none',
    color: '#17171c',
    eyeColor: '#ffffff',
    outlineColor: '#ffffff',
    outlineWidth: 8,
    background: { type: 'solid', color: '#9775fa' },
    size: 256,
    defaultState: 'idle',
    reactions: Object.fromEntries(
      REACTIONS.map((state) => [
        state,
        normalizeMotion({
          duration: state === 'idle' ? 2400 : 800,
          intensity: 60,
          movements: moves[state].map((type) => ({ type, enabled: true })),
        }),
      ]),
    ),
    export: {
      folder: 'src/components/mascot',
      format: 'javascript',
      framework: 'react',
    },
    accessibility: {
      respectReducedMotion: true,
      pauseOffscreen: true,
      label: 'GhostEye mascot',
    },
  };
  return {
    ...defaults,
    ...overrides,
    background: { ...defaults.background, ...overrides.background },
    export: { ...defaults.export, ...overrides.export },
    accessibility: { ...defaults.accessibility, ...overrides.accessibility },
    reactions: Object.fromEntries(
      REACTIONS.map((state) => [
        state,
        normalizeMotion(
          overrides.reactions?.[state] || defaults.reactions[state],
        ),
      ]),
    ),
  };
}
export function validateConfig(config) {
  const errors = [];
  const color = /^#[\da-f]{6}$/i;
  if (!/^[A-Z][A-Za-z0-9]*$/.test(config.componentName))
    errors.push(
      'Component name must be a valid PascalCase JavaScript identifier.',
    );
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.slug))
    errors.push('Slug must use lowercase letters, numbers and hyphens.');
  if (!config.name?.trim()) errors.push('Mascot name is required.');
  if (!SHAPES.includes(config.shape)) errors.push('Choose a supported shape.');
  if (!EYES.includes(config.eyes)) errors.push('Choose supported eyes.');
  if (!['none', 'smile', 'small'].includes(config.mouth))
    errors.push('Choose a supported mouth.');
  for (const key of ['color', 'eyeColor', 'outlineColor'])
    if (!color.test(config[key])) errors.push(`Invalid ${key}.`);
  if (
    !color.test(config.background?.color) ||
    !['solid', 'gradient', 'transparent'].includes(config.background?.type)
  )
    errors.push('Invalid background.');
  if (!Number.isFinite(config.size) || config.size < 48 || config.size > 512)
    errors.push('Size must be between 48 and 512.');
  if (
    !Number.isFinite(config.outlineWidth) ||
    config.outlineWidth < 0 ||
    config.outlineWidth > 16
  )
    errors.push('Outline must be between 0 and 16.');
  if (!REACTIONS.includes(config.defaultState))
    errors.push('Choose a supported default state.');
  if (
    !config.export?.folder?.trim() ||
    /[\0<>:"|?*]/.test(config.export.folder) ||
    config.export.folder.split(/[\\/]/).some((p) => p === '..')
  )
    errors.push('Choose a safe export folder without parent traversal.');
  if (config.export?.format !== 'javascript')
    errors.push('V1 exports JavaScript only.');
  if (!['react', 'next'].includes(config.export?.framework))
    errors.push('Choose React or Next.js.');
  return errors;
}
export function animationPlan(motion, reduced = false) {
  if (reduced) return [];
  const value = normalizeMotion(motion);
  const enabled = value.movements.filter((m) => m.enabled);
  const strength = value.intensity / 100;
  const transforms = {
    bounce: `translateY(${-18 * strength}px)`,
    squash: `scale(${1 + 0.18 * strength}, ${1 - 0.16 * strength})`,
    tilt: `rotate(${10 * strength}deg)`,
    shake: `translateX(${9 * strength}px)`,
    blink: `scaleY(${1 - 0.94 * strength})`,
    'eye-movement': `translate(${7 * strength}px, ${-4 * strength}px)`,
    mouth: `scale(${1 + 0.4 * strength}, ${1 + 0.3 * strength})`,
  };
  return enabled.map((move, index) => ({
    type: move.type,
    target:
      move.type === 'blink' || move.type === 'eye-movement'
        ? 'eyes'
        : move.type === 'mouth'
          ? 'mouth'
          : move.type,
    keyframes: [
      { transform: 'none', offset: 0 },
      { transform: transforms[move.type], offset: 0.5 / enabled.length },
      { transform: 'none', offset: 1 / enabled.length },
      ...(enabled.length > 1 ? [{ transform: 'none', offset: 1 }] : []),
    ],
    options: {
      duration: value.duration,
      delay: (index * value.duration) / enabled.length,
      easing: value.easing,
      iterations: value.playback === 'loop' ? Infinity : 1,
      fill: 'none',
    },
  }));
}
