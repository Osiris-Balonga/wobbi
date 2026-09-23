import { createElement, useEffect, useRef } from 'react';
import { resolveState } from '../../packages/core/config.js';
import { renderParts } from '../../packages/core/render.js';
import { mountCharacter } from '../../packages/core/motion.js';
import './mascot.css';
import { localizedMascotLabel, useLocale } from '../i18n/index.js';
export function Mascot({
  config,
  state = config.defaultState,
  size = config.size,
  playing = true,
  replay = 0,
  interactive = false,
  ...props
}) {
  const { locale } = useLocale();
  const ref = useRef(null);
  const reaction = resolveState(state);
  useEffect(
    () => mountCharacter(ref.current, config, reaction, playing, interactive),
    [config, reaction, playing, replay, interactive],
  );
  return (
    <svg
      ref={ref}
      className="wobbi-mascot"
      viewBox="-16 -16 288 288"
      width={size}
      height={size}
      role="img"
      aria-label={
        props['aria-label'] ||
        localizedMascotLabel(locale, config.accessibility.label)
      }
      data-state={reaction}
      data-respect-motion={config.accessibility.respectReducedMotion}
      {...props}
    >
      {renderParts(createElement, config, reaction)}
    </svg>
  );
}
