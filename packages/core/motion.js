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
