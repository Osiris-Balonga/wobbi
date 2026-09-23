import { readFileSync } from 'node:fs';
import {
  generateSource,
  generateVanilla,
  generateVueSource,
} from './generate.js';
const source = (name) =>
  readFileSync(new URL(`../core/${name}.js`, import.meta.url), 'utf8');
const sources = {
  config: source('config'),
  renderModel: source('render-model'),
  renderEffects: source('render-effects'),
  render: source('render'),
  motion: source('motion'),
  svgAttributes: source('svg-attributes'),
};
export const generateFiles = (config) => generateSource(config, sources);
export const generateVueFiles = (config) => generateVueSource(config, sources);
export const generateVanillaFiles = (config, locale = 'en') =>
  generateVanilla(config, sources, locale);
