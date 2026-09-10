import {readFileSync} from 'node:fs';
import {generateSource} from './generate.js';
const source=(name)=>readFileSync(new URL(`../core/${name}.js`,import.meta.url),'utf8');
const sources={config:source('config'),render:source('render'),motion:source('motion')};
export const generateFiles=(config)=>generateSource(config,sources);
