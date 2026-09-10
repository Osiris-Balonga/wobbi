import configSource from '../core/config.js?raw';
import renderSource from '../core/render.js?raw';
import motionSource from '../core/motion.js?raw';
import { generateSource } from './generate.js';
export const generateFiles = (config) =>
  generateSource(config, {
    config: configSource,
    render: renderSource,
    motion: motionSource,
  });
