import configSource from '../core/config.js?raw';
import renderModelSource from '../core/render-model.js?raw';
import renderEffectsSource from '../core/render-effects.js?raw';
import renderSource from '../core/render.js?raw';
import motionSource from '../core/motion.js?raw';
import {
  generateSource,
  generateVanilla,
  generateVueSource,
} from './generate.js';
export const generateVanillaFiles = (config) =>
  generateVanilla(config, {
    config: configSource,
    renderModel: renderModelSource,
    renderEffects: renderEffectsSource,
    render: renderSource,
    motion: motionSource,
  });
export const generateFiles = (config) =>
  generateSource(config, {
    config: configSource,
    renderModel: renderModelSource,
    renderEffects: renderEffectsSource,
    render: renderSource,
    motion: motionSource,
  });
export const generateVueFiles = (config) =>
  generateVueSource(config, {
    config: configSource,
    renderModel: renderModelSource,
    renderEffects: renderEffectsSource,
    render: renderSource,
    motion: motionSource,
  });
