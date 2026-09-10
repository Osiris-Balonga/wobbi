import { createElement, useEffect, useRef } from 'react';
import { resolveState } from '../../packages/core/config.js';
import { renderParts } from '../../packages/core/render.js';
import { mountMotion } from '../../packages/core/motion.js';
import './mascot.css';
export function Mascot({
  config,
  state = config.defaultState,
  size = config.size,
  playing = true,
  replay = 0,
  ...props
}) {
  const ref = useRef(null);
  const reaction = resolveState(state);
  const motion = config.reactions[reaction];
  useEffect(
    () => mountMotion(ref.current, motion, config.accessibility, playing),
    [motion, config.accessibility, playing, replay],
  );
  return (
    <svg
      ref={ref}
      className="wobbi-mascot"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      role="img"
      aria-label={props['aria-label'] || config.accessibility.label}
      data-state={reaction}
      data-respect-motion={config.accessibility.respectReducedMotion}
      {...props}
    >
      {renderParts(createElement, config, reaction)}
    </svg>
  );
}
