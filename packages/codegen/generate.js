import { createConfig, validateConfig } from '../core/config.js';
export function generateSource(input, sources) {
  const config = createConfig(input);
  const errors = validateConfig(config);
  if (errors.length) throw new Error(errors.join('\n'));
  const name = config.componentName;
  const className = `wobbi-${config.slug}`;
  const component = `${config.export.framework === 'next' ? "'use client';\n\n" : ''}import { createElement, useEffect, useRef } from 'react';
import { resolveState, mountMotion } from './animations.js';
import './styles.css';

// This is your mascot. Edit its configuration, geometry and behavior freely.
const config = ${JSON.stringify(config, null, 2)};

export function ${name}({ state = config.defaultState, size = config.size, playing = true, ...props }) {
  const ref = useRef(null);
  const reaction = resolveState(state);
  useEffect(() => mountMotion(ref.current, config.reactions[reaction], config.accessibility, playing), [reaction, playing]);
  return (
    <svg ref={ref} className="${className}" viewBox="0 0 256 256"
      width={size} height={size} role="img"
      aria-label={config.accessibility.label} data-state={reaction}
      data-respect-motion={config.accessibility.respectReducedMotion} {...props}>
      {renderParts(createElement, config, reaction)}
    </svg>
  );
}

${sources.render.replace('export function renderParts', 'function renderParts')}
`;
  return {
    [`${name}.jsx`]: component,
    'animations.js': `// Editable movement definitions and lifecycle. No Wobbi runtime required.\n${sources.config}\n${sources.motion.replace(/import \{animationPlan\} from '\.\/config\.js';\r?\n/, '').replace(/import \{ animationPlan \} from '\.\/config\.js';\r?\n/, '')}`,
    'styles.css': `.${className} { display: block; overflow: visible; flex: none; }\n.${className} [data-motion] { transform-box: fill-box; transform-origin: center; }\n@media (prefers-reduced-motion: reduce) {\n  .${className}[data-respect-motion="true"] [data-motion] { animation: none !important; transform: none !important; }\n}\n`,
    'index.js': `export { ${name} } from './${name}.jsx';\n`,
  };
}
