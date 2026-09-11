import { createConfig, validateConfig } from '../core/config.js';

const REACTION_LABELS = {
  idle: 'Repos',
  happy: 'Joie',
  thinking: 'Réflexion',
  surprised: 'Surprise',
  sad: 'Peur',
  error: 'Colère',
  success: 'Succès',
  loading: 'Chargement',
  sleeping: 'Sommeil',
  singing: 'Chant',
  special: 'Spécial',
};

function prepare(input) {
  const errors = validateConfig(input);
  if (errors.length) throw new Error(errors.join('\n'));
  return createConfig(input);
}

function cleanSource(source) {
  return source
    .replace(/^\s*\/\/.*(?:\r?\n|$)/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );
}

function configModule(config) {
  return `const VALID_STATES = new Set(${JSON.stringify([...Object.keys(REACTION_LABELS)])});

export const resolveState = (state) => VALID_STATES.has(state) ? state : 'idle';

export const preset = ${JSON.stringify(config, null, 2)};
`;
}

function componentSource(config) {
  return `'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { preset, resolveState } from './preset.js';
import { renderParts } from './render.js';
import { mountCharacter, reactionDuration } from './motion.js';
import './${config.componentName}.css';

export function ${config.componentName}({
  state = preset.defaultState,
  size = preset.size,
  playing = true,
  interactive = true,
  ...props
}) {
  const ref = useRef(null);
  const [poked, setPoked] = useState(false);
  const reaction = poked ? 'happy' : resolveState(state);

  useEffect(
    () => mountCharacter(ref.current, preset, reaction, playing, interactive),
    [reaction, playing, interactive],
  );

  useEffect(() => {
    if (!poked) return undefined;
    const timer = setTimeout(() => setPoked(false), reactionDuration('happy'));
    return () => clearTimeout(timer);
  }, [poked]);

  function react() {
    if (interactive) setPoked(true);
  }

  return (
    <svg
      ref={ref}
      className="wobbi-character"
      viewBox="-16 -16 288 288"
      width={size}
      height={size}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={preset.accessibility.label}
      data-state={reaction}
      data-respect-motion={preset.accessibility.respectReducedMotion}
      onClick={react}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                react();
              }
            }
          : undefined
      }
      {...props}
    >
      {renderParts(createElement, preset, reaction)}
    </svg>
  );
}
`;
}

const animationPlanRuntime = `function animationPlan(motion, reduced = false) {
  if (reduced) return [];
  const enabled = (motion.movements || []).filter((move) => move.enabled);
  const strength = motion.intensity / 100;
  const transforms = {
    bounce: \`translateY(\${-18 * strength}px)\`,
    squash: \`scale(\${1 + 0.18 * strength}, \${1 - 0.16 * strength})\`,
    tilt: \`rotate(\${10 * strength}deg)\`,
    shake: \`translateX(\${9 * strength}px)\`,
    blink: \`scaleY(\${1 - 0.94 * strength})\`,
    'eye-movement': \`translate(\${7 * strength}px, \${-4 * strength}px)\`,
    mouth: \`scale(\${1 + 0.4 * strength}, \${1 + 0.3 * strength})\`,
  };
  return enabled.map((move, index) => ({
    type: move.type,
    target: move.type === 'blink' || move.type === 'eye-movement'
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
      duration: motion.duration,
      delay: (index * motion.duration) / enabled.length,
      easing: motion.easing,
      iterations: motion.playback === 'loop' ? Infinity : 1,
      fill: 'none',
    },
  }));
}`;

function motionModule(source) {
  return `${animationPlanRuntime}\n\n${cleanSource(
    source.replace(/^import\s+[^;]+;\s*/gm, ''),
  )}\n`;
}

const componentStyles = `.wobbi-character {
  display: block;
  overflow: visible;
}

.wobbi-character [data-eye] {
  transform-box: fill-box;
  transform-origin: center;
}

.wobbi-character:focus-visible {
  border-radius: 20px;
  outline: 2px solid #9270ff;
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .wobbi-character * {
    transition: none !important;
  }
}
`;

export function generateSource(input, sources) {
  const config = prepare(input);
  const name = config.componentName;
  return {
    [`${name}.jsx`]: componentSource(config),
    [`${name}.css`]: componentStyles,
    'preset.js': configModule(config),
    'render-model.js': `${cleanSource(sources.renderModel)}\n`,
    'render-effects.js': `${cleanSource(sources.renderEffects)}\n`,
    'render.js': `${cleanSource(sources.render)}\n`,
    'motion.js': motionModule(sources.motion),
    'index.js': `export { ${name} } from './${name}.jsx';\n`,
  };
}

function vueComponentSource(config) {
  return `<script>
import { computed, defineComponent, h, onBeforeUnmount, ref, watchEffect } from 'vue';
import { preset, resolveState } from './preset.js';
import { renderParts } from './render.js';
import { mountCharacter, reactionDuration } from './motion.js';

export default defineComponent({
  name: '${config.componentName}',
  inheritAttrs: false,
  props: {
    state: { type: String, default: () => preset.defaultState },
    size: { type: Number, default: () => preset.size },
    playing: { type: Boolean, default: true },
    interactive: { type: Boolean, default: true },
  },
  setup(props, { attrs }) {
    const element = ref(null);
    const poked = ref(false);
    const reaction = computed(() => poked.value ? 'happy' : resolveState(props.state));
    let timer;

    watchEffect((onCleanup) => {
      if (!element.value) return;
      const dispose = mountCharacter(
        element.value,
        preset,
        reaction.value,
        props.playing,
        props.interactive,
      );
      onCleanup(dispose);
    });

    onBeforeUnmount(() => clearTimeout(timer));

    function react() {
      if (!props.interactive) return;
      clearTimeout(timer);
      poked.value = true;
      timer = setTimeout(() => { poked.value = false; }, reactionDuration('happy'));
    }

    function onKeydown(event) {
      if (!props.interactive || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      react();
    }

    return () => h(
      'svg',
      {
        ...attrs,
        ref: element,
        class: ['wobbi-character', attrs.class],
        viewBox: '-16 -16 288 288',
        width: props.size,
        height: props.size,
        role: props.interactive ? 'button' : 'img',
        tabindex: props.interactive ? 0 : undefined,
        'aria-label': attrs['aria-label'] || preset.accessibility.label,
        'data-state': reaction.value,
        'data-respect-motion': preset.accessibility.respectReducedMotion,
        onClick: react,
        onKeydown,
      },
      renderParts(
        (tag, attributes, ...children) =>
          h(
            tag,
            attributes,
            children.length === 1 ? children[0] : children,
          ),
        preset,
        reaction.value,
      ),
    );
  },
});
</script>

<style src="./${config.componentName}.css"></style>
`;
}

export function generateVueSource(input, sources) {
  const config = prepare(input);
  const name = config.componentName;
  return {
    [`${name}.vue`]: vueComponentSource(config),
    [`${name}.css`]: componentStyles,
    'preset.js': configModule(config),
    'render-model.js': `${cleanSource(sources.renderModel)}\n`,
    'render-effects.js': `${cleanSource(sources.renderEffects)}\n`,
    'render.js': `${cleanSource(sources.render)}\n`,
    'motion.js': motionModule(sources.motion),
    'index.js': `export { default as ${name} } from './${name}.vue';\n`,
  };
}

const previewStyles = `:root {
  color: #171321;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  background: #f4f1ff;
}

* { box-sizing: border-box; }

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}

button { font: inherit; }

.preview-shell {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(260px, 360px);
  min-height: 100vh;
}

.preview-stage {
  display: grid;
  place-items: center;
  min-height: 520px;
  padding: 40px;
  background: #f1edff;
}

.preview-panel {
  padding: 36px 28px;
  background: white;
  box-shadow: -12px 0 32px rgb(38 24 74 / 8%);
}

.preview-panel h1 { margin: 0 0 8px; font-size: 28px; }
.preview-panel p { margin: 0 0 24px; color: #716980; line-height: 1.5; }
.preview-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }

.preview-actions button,
.play-toggle {
  min-height: 42px;
  border: 1px solid #ded7ec;
  border-radius: 10px;
  color: #322744;
  background: white;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.preview-actions button:hover,
.play-toggle:hover { border-color: #9270ff; background: #f5f1ff; }
.preview-actions button:active,
.play-toggle:active { transform: scale(.96); }
.preview-actions button[aria-pressed='true'] { border-color: #7650db; color: #6842cf; background: #eee7ff; }
.play-toggle { width: 100%; margin-top: 16px; }

@media (max-width: 720px) {
  .preview-shell { grid-template-columns: 1fr; }
  .preview-stage { min-height: 390px; padding: 24px; }
  .preview-panel { box-shadow: 0 -12px 32px rgb(38 24 74 / 8%); }
}
`;

function reactPreview(config) {
  const buttons = Object.entries(REACTION_LABELS)
    .map(
      ([id, label]) =>
        `        <button aria-pressed={state === '${id}'} onClick={() => setState('${id}')}>${label}</button>`,
    )
    .join('\n');
  return `import { useState } from 'react';
import { preset } from './preset.js';
import { ${config.componentName} } from './${config.componentName}.jsx';

export function Preview() {
  const [state, setState] = useState('idle');
  const [playing, setPlaying] = useState(true);

  return (
    <main className="preview-shell">
      <section
        className="preview-stage"
        aria-label="Aperçu de la mascotte"
        data-gaze-zone
        style={{
          backgroundColor:
            preset.background.type === 'transparent'
              ? 'transparent'
              : preset.background.color,
        }}
      >
        <${config.componentName} state={state} playing={playing} size={320} />
      </section>
      <aside className="preview-panel">
        <h1>{preset.name}</h1>
        <p>Testez toutes les réactions. Cliquez aussi directement sur la mascotte.</p>
        <div className="preview-actions">
${buttons}
        </div>
        <button className="play-toggle" onClick={() => setPlaying((value) => !value)}>
          {playing ? 'Mettre en pause' : 'Reprendre les animations'}
        </button>
      </aside>
    </main>
  );
}
`;
}

export function generateReactProject(input, sources) {
  const config = prepare(input);
  const componentFiles = generateSource(config, sources);
  const files = Object.fromEntries(
    Object.entries(componentFiles).map(([name, value]) => [
      `src/${name}`,
      value,
    ]),
  );
  return {
    'package.json':
      JSON.stringify(
        {
          name: `${config.slug}-preview`,
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
          devDependencies: {
            '@vitejs/plugin-react': '^6.0.0',
            vite: '^8.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    'index.html':
      '<!doctype html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Aperçu Wobbi</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n',
    'README.md': `# ${config.name} — aperçu React\n\nLancez \`npm install\`, puis \`npm run dev\`. Le composant réutilisable est exporté par \`src/index.js\` et la page de démonstration permet de tester toutes les réactions.\n`,
    'vite.config.js': `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()] });\n`,
    ...files,
    'src/Preview.jsx': reactPreview(config),
    'src/preview.css': previewStyles,
    'src/main.jsx': `import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { Preview } from './Preview.jsx';\nimport './preview.css';\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <Preview />\n  </StrictMode>,\n);\n`,
  };
}

export function generateVanilla(input, sources) {
  const config = prepare(input);
  const controls = Object.entries(REACTION_LABELS)
    .map(
      ([id, label]) =>
        `    <button data-state="${id}"${id === 'idle' ? ' aria-pressed="true"' : ''}>${label}</button>`,
    )
    .join('\n');
  const stripModuleSyntax = (source) =>
    source
      .replace(/^import\s+[^;]+;\s*/gm, '')
      .replace(/\bexport\s+(?=(const|let|var|function|class)\b)/g, '');
  const configScript = `(() => {
'use strict';

${stripModuleSyntax(configModule(config))}

window.WobbiConfig = { preset, resolveState };
})();
`;
  const rendererScript = `(() => {
'use strict';

${stripModuleSyntax(cleanSource(sources.renderModel))}

${stripModuleSyntax(cleanSource(sources.renderEffects))}

${stripModuleSyntax(cleanSource(sources.render))}

window.WobbiRenderer = { renderParts };
})();
`;
  const animationsScript = `(() => {
'use strict';

${stripModuleSyntax(motionModule(sources.motion))}

window.WobbiMotion = { mountCharacter, reactionDuration };
})();
`;
  const mascotScript = `(() => {
'use strict';

const { preset, resolveState } = window.WobbiConfig;
const { renderParts } = window.WobbiRenderer;
const { mountCharacter, reactionDuration } = window.WobbiMotion;
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

${stripModuleSyntax(cleanSource(sources.svgAttributes))}

function node(tag, props, ...children) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (key === 'key' || value == null) continue;
    if (key === 'style') {
      Object.assign(element.style, value);
      continue;
    }
    element.setAttribute(svgAttributeName(key), String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child != null) element.append(child);
  }
  return element;
}

function createMascot(container, options = {}) {
  let { size = preset.size, playing = true, interactive = true, state = 'idle' } = options;
  const svg = node('svg', {
    class: 'wobbi-character',
    viewBox: '-16 -16 288 288',
    width: size,
    height: size,
    role: interactive ? 'button' : 'img',
    'aria-label': preset.accessibility.label,
  });
  if (interactive) svg.setAttribute('tabindex', '0');
  container.append(svg);

  let cleanup = () => {};
  let timer;
  let disposed = false;
  let current = resolveState(state);
  let base = current;

  function render(next) {
    cleanup();
    current = resolveState(next);
    svg.replaceChildren(renderParts(node, preset, current));
    svg.setAttribute('data-state', current);
    cleanup = mountCharacter(svg, preset, current, playing, interactive);
  }

  function react() {
    if (!interactive) return;
    clearTimeout(timer);
    render('happy');
    timer = setTimeout(() => {
      if (!disposed) render(base);
    }, reactionDuration('happy'));
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      react();
    }
  }

  svg.addEventListener('click', react);
  svg.addEventListener('keydown', onKeyDown);
  render(current);

  return {
    element: svg,
    setState(next) {
      if (disposed) return;
      clearTimeout(timer);
      base = resolveState(next);
      render(base);
    },
    setPlaying(next) {
      if (disposed) return;
      playing = Boolean(next);
      render(current);
    },
    destroy() {
      disposed = true;
      clearTimeout(timer);
      cleanup();
      svg.removeEventListener('click', react);
      svg.removeEventListener('keydown', onKeyDown);
      svg.remove();
    },
  };
}

window.WobbiMascot = { createMascot, preset };
})();
`;
  const previewScript = `(() => {
'use strict';

const { createMascot, preset } = window.WobbiMascot;
const mascot = createMascot(document.querySelector('#mascot'), { size: 320 });
const buttons = [...document.querySelectorAll('[data-state]')];
const playButton = document.querySelector('#play-toggle');
const previewStage = document.querySelector('.preview-stage');
let playing = true;

document.querySelector('#mascot-name').textContent = preset.name;
previewStage.style.backgroundColor =
  preset.background.type === 'transparent'
    ? 'transparent'
    : preset.background.color;
for (const button of buttons) {
  button.addEventListener('click', () => {
    mascot.setState(button.dataset.state);
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
  });
}
playButton.addEventListener('click', () => {
  playing = !playing;
  mascot.setPlaying(playing);
  playButton.textContent = playing ? 'Mettre en pause' : 'Reprendre les animations';
});

window.mascot = mascot;
})();
`;
  return {
    'index.html': `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(config.name)} — aperçu Wobbi</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="config.js" defer></script>
    <script src="renderer.js" defer></script>
    <script src="animations.js" defer></script>
    <script src="mascot.js" defer></script>
    <script src="preview.js" defer></script>
  </head>
  <body>
    <main class="preview-shell">
      <section class="preview-stage" aria-label="Aperçu de la mascotte" data-gaze-zone>
        <div id="mascot"></div>
      </section>
      <aside class="preview-panel">
        <h1 id="mascot-name"></h1>
        <p>Testez toutes les réactions. Cliquez aussi directement sur la mascotte.</p>
        <div class="preview-actions">
${controls}
        </div>
        <button class="play-toggle" id="play-toggle">Mettre en pause</button>
      </aside>
    </main>
  </body>
</html>
`,
    'styles.css': `${componentStyles}\n${previewStyles}`,
    'config.js': configScript,
    'renderer.js': rendererScript,
    'animations.js': animationsScript,
    'mascot.js': mascotScript,
    'preview.js': previewScript,
    'README.md': `# ${config.name} — aperçu JavaScript\n\nOuvrez directement \`index.html\` dans un navigateur : aucun serveur, paquet ou outil de build n’est nécessaire. Les responsabilités sont séparées entre \`config.js\`, \`renderer.js\`, \`animations.js\`, \`mascot.js\` et \`preview.js\`. \`mascot.js\` expose \`window.WobbiMascot.createMascot\` pour intégrer la mascotte ailleurs.\n`,
  };
}
