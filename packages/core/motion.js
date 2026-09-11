import { animationPlan } from './config.js';
// Cleans up both animations and observers; responds to live OS preferences.
export function mountMotion(element, motion, preferences, playing) {
  if (!element || !playing) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let visible = true;
  const cancel = () => {
    animations.forEach((a) => a.cancel());
    animations = [];
  };
  const update = () => {
    cancel();
    const reduced = preferences.respectReducedMotion && media.matches;
    for (const step of animationPlan(motion, reduced)) {
      const target = element.querySelector(`[data-motion="${step.type}"]`);
      if (target?.animate)
        animations.push(target.animate(step.keyframes, step.options));
    }
    if (!visible) animations.forEach((a) => a.pause());
  };
  update();
  media.addEventListener('change', update);
  let observer;
  if (
    preferences.pauseOffscreen &&
    typeof IntersectionObserver !== 'undefined'
  ) {
    observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      animations.forEach((a) => (visible ? a.play() : a.pause()));
    });
    observer.observe(element);
  }
  return () => {
    cancel();
    media.removeEventListener('change', update);
    observer?.disconnect();
  };
}

export function reactionDuration(state) {
  return (
    {
      happy: 1600,
      success: 1800,
      surprised: 1200,
      thinking: 3000,
      sad: 2200,
      error: 1300,
      loading: 3600,
      sleeping: 3600,
      singing: 2800,
    }[state] || 0
  );
}
// Authored phases: anticipation, action, settling. Time is explicit for faithful recordings.
export function sampleCharacter(config, state, time, look = { x: 0, y: 0 }) {
  const t = Math.max(0, time);
  const frame = {
    x: 0,
    y: 0,
    sx: 1,
    sy: 1,
    rotate: 0,
    opacity: 1,
    gx: look.x || 0,
    gy: look.y || 0,
    blink: 1,
    ears: 0,
    shadow: 1,
  };
  const soft = ['ghost', 'cloud', 'wobbi'].includes(config.shape);
  frame.y = soft ? Math.sin(t * 1.7) * 2.6 : 0;
  frame.gx += Math.sin(t * 0.71) * 1.2;
  frame.gy += Math.sin(t * 0.47) * 0.8;
  const blinkTime = t % 6.7;
  if (blinkTime > 2.8 && blinkTime < 2.98)
    frame.blink = 1 - 0.98 * Math.sin(((blinkTime - 2.8) / 0.18) * Math.PI);
  if (blinkTime > 3.2 && blinkTime < 3.34)
    frame.blink = 1 - 0.96 * Math.sin(((blinkTime - 3.2) / 0.14) * Math.PI);
  const points = (rows, phase) => {
    const b = rows.findIndex((r) => r[0] >= phase);
    if (b <= 0) return rows[b < 0 ? rows.length - 1 : 0].slice(1);
    const a = rows[b - 1],
      z = rows[b],
      v = (phase - a[0]) / (z[0] - a[0]),
      u = v * v * (3 - 2 * v);
    return a.slice(1).map((x, i) => x + (z[i + 1] - x) * u);
  };
  if (['happy', 'success'].includes(state)) {
    const p = Math.min(t / 1.45, 1);
    const [y, sx, sy, r] = points(
      [
        [0, 0, 1, 1, 0],
        [0.13, 9, 1.12, 0.86, -3],
        [0.29, -20, 0.94, 1.12, 1],
        [0.48, -32, 0.98, 1.04, 4],
        [0.68, 5, 1.13, 0.86, -2],
        [0.83, -3, 0.98, 1.03, 1],
        [1, 0, 1, 1, 0],
      ],
      p,
    );
    Object.assign(frame, {
      y,
      sx,
      sy,
      rotate: r,
    });
  }
  if (state === 'thinking') {
    frame.rotate = Math.sin((Math.min(t / 1.1, 1) * Math.PI) / 2) * 7;
    frame.gx += 5;
    frame.gy -= 6;
  }
  if (state === 'loading') {
    frame.y = Math.sin(t * 2) * 2;
    frame.rotate = Math.sin(t * 1.3) * 3;
    frame.gx += Math.sin(t * 1.8) * 3;
  }
  if (state === 'sleeping') {
    frame.y += Math.sin(t * 1.35) * 1.6 + 3;
    frame.rotate = Math.sin(t * 0.72) * 1.8;
    frame.blink = 1;
  }
  if (state === 'singing') {
    frame.y = -6 - Math.abs(Math.sin(t * 4.2)) * 9;
    frame.rotate = Math.sin(t * 4.2) * 4;
    frame.sx = 1 + Math.sin(t * 8.4) * 0.025;
    frame.sy = 2 - frame.sx;
  }
  if (state === 'sad') {
    frame.y += Math.min(t, 1) * 5;
    frame.rotate = 5;
    frame.gy += 4;
  }
  if (state === 'error') {
    frame.x = Math.sin(t * 27) * 6 * Math.max(0, 1 - t / 1.1);
    frame.rotate = frame.x * 0.6;
  }
  if (state === 'surprised') {
    frame.sy = 1 + Math.sin(Math.min(t / 0.9, 1) * Math.PI) * 0.14;
    frame.sx = 2 - frame.sy;
    frame.y = -Math.sin(Math.min(t / 0.9, 1) * Math.PI) * 8;
  }
  frame.shadow = 1 + Math.min(0, frame.y) * 0.012;
  return frame;
}
export function applyCharacterFrame(element, f, time = 0) {
  const part = (p) => element.querySelector('[data-part="' + p + '"]');
  part('body')?.setAttribute(
    'transform',
    `translate(${f.x} ${f.y}) translate(128 215) rotate(${f.rotate}) scale(${f.sx} ${f.sy}) translate(-128 -215)`,
  );
  part('body')?.setAttribute('opacity', String(f.opacity));
  part('shadow')?.setAttribute(
    'transform',
    `translate(128 238) scale(${f.shadow} 1) translate(-128 -238)`,
  );
  part('gaze')?.setAttribute(
    'transform',
    `translate(${f.gx * 0.35} ${f.gy * 0.35})`,
  );
  element
    .querySelectorAll('[data-part="pupil"]')
    .forEach((p) =>
      p.setAttribute('transform', `translate(${f.gx * 0.65} ${f.gy * 0.65})`),
    );
  element.querySelectorAll('[data-eye]').forEach((p) => {
    const expressionClosed =
      p.getAttribute('data-expression-closed') === 'true';
    p.style.transform = `scaleY(${expressionClosed ? 1 : f.blink})`;
    p.setAttribute(
      'opacity',
      String(expressionClosed ? 1 : Math.min(1, f.blink * 3)),
    );
  });
  element
    .querySelectorAll('[data-blink-line]')
    .forEach((p) =>
      p.setAttribute('opacity', String(1 - Math.min(1, f.blink * 3))),
    );
  part('accessory')?.setAttribute(
    'transform',
    `translate(${f.gx * 0.15} ${f.gy * 0.15})`,
  );
  part('ear-0')?.setAttribute('transform', `rotate(${f.ears} 70 62)`);
  part('ear-1')?.setAttribute('transform', `rotate(${-f.ears} 185 62)`);
  part('bunny-ear-0')?.setAttribute(
    'transform',
    `rotate(${f.ears * 0.45} 104 68)`,
  );
  part('bunny-ear-1')?.setAttribute(
    'transform',
    `rotate(${-f.ears * 0.45} 152 68)`,
  );
  part('round-ear-0')?.setAttribute('transform', `rotate(${f.ears} 70 62)`);
  part('round-ear-1')?.setAttribute('transform', `rotate(${-f.ears} 185 62)`);
  part('halo')?.setAttribute(
    'transform',
    `translate(0 ${Math.sin(time * 3.1) * 3})`,
  );
  element.querySelectorAll('[data-wait-dot]').forEach((p, i) => {
    p.setAttribute(
      'opacity',
      String(0.3 + (0.7 * (Math.sin(time * 5 - i * 1.6) + 1)) / 2),
    );
  });
  element.querySelectorAll('[data-sleep-z]').forEach((node, i) => {
    const phase = (time * 0.55 + i * 0.28) % 1;
    node.setAttribute('opacity', String(Math.sin(phase * Math.PI) * 0.9));
    node.setAttribute('transform', `translate(0 ${-phase * 12})`);
  });
  const idea = element.querySelector('[data-effect="idea"]');
  idea?.setAttribute('transform', `translate(0 ${-Math.sin(time * 3) * 3})`);
  const singing = element.querySelector('[data-effect="singing"]');
  singing?.setAttribute(
    'transform',
    `translate(0 ${-Math.abs(Math.sin(time * 3.4)) * 9})`,
  );
}
export function mountCharacter(
  element,
  config,
  state = 'idle',
  playing = true,
  interactive = true,
) {
  if (!element || !playing) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interactionTarget =
    element.closest?.('[data-gaze-zone]') || element.parentElement || element;
  let raf = 0,
    visible = true,
    last = 0,
    elapsed = 0,
    disposed = false;
  let target = { x: 0, y: 0 },
    look = { x: 0, y: 0 };
  const allowed = () =>
    playing &&
    !(config.accessibility.respectReducedMotion && media.matches) &&
    visible &&
    !document.hidden;
  const move = (event) => {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    target = {
      x: Math.max(
        -9,
        Math.min(
          9,
          ((event.clientX - rect.left - rect.width / 2) / rect.width) * 18,
        ),
      ),
      y: Math.max(
        -7,
        Math.min(
          7,
          ((event.clientY - rect.top - rect.height / 2) / rect.height) * 14,
        ),
      ),
    };
  };
  const leave = () => {
    target = { x: 0, y: 0 };
  };
  const tick = (now) => {
    if (disposed || !allowed()) {
      last = 0;
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, 0.06) : 0;
    last = now;
    elapsed += dt;
    look.x += (target.x - look.x) * (1 - Math.exp(-dt * 9));
    look.y += (target.y - look.y) * (1 - Math.exp(-dt * 9));
    applyCharacterFrame(
      element,
      sampleCharacter(config, state, elapsed, look),
      elapsed,
    );
    raf = requestAnimationFrame(tick);
  };
  const restart = () => {
    cancelAnimationFrame(raf);
    last = 0;
    if (allowed()) raf = requestAnimationFrame(tick);
    else if (media.matches)
      applyCharacterFrame(element, sampleCharacter(config, state, 0), 0);
  };
  media.addEventListener('change', restart);
  document.addEventListener('visibilitychange', restart);
  if (interactive) {
    interactionTarget.addEventListener('pointermove', move, { passive: true });
    interactionTarget.addEventListener('pointerleave', leave);
  }
  let observer;
  if (
    config.accessibility.pauseOffscreen &&
    typeof IntersectionObserver !== 'undefined'
  ) {
    observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      restart();
    });
    observer.observe(element);
  }
  restart();
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    observer?.disconnect();
    media.removeEventListener('change', restart);
    document.removeEventListener('visibilitychange', restart);
    interactionTarget.removeEventListener('pointermove', move);
    interactionTarget.removeEventListener('pointerleave', leave);
  };
}
