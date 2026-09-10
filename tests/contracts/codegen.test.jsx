import {it,expect,afterEach} from 'vitest';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {render,screen,cleanup} from '@testing-library/react';
import {generateFiles} from '../../packages/codegen/node.js';
import {createConfig,REACTIONS} from '../../packages/core/config.js';
const require=createRequire(import.meta.url);
const folders=[];
afterEach(async()=>{await Promise.all(folders.splice(0).map(dir=>rm(dir,{recursive:true,force:true})));});
it('writes exactly four editable files that compile, import and render all states',async()=>{
 const config=createConfig({componentName:'MyBuddy',size:180,export:{framework:'next'}});
 const files=generateFiles(config);
 expect(Object.keys(files)).toEqual(['MyBuddy.jsx','animations.js','styles.css','index.js']);
 expect(files['MyBuddy.jsx']).toMatch(/^'use client'/);
 expect(Object.values(files).join('\n')).not.toMatch(/localStorage|src\/studio|fetch\(/);
 const dir=await mkdtemp(path.join(tmpdir(),'wobbi-contract-'));folders.push(dir);
 await Promise.all(Object.entries(files).map(([name,source])=>writeFile(path.join(dir,name),source)));
 const result=await build({entryPoints:[path.join(dir,'index.js')],bundle:true,write:false,platform:'node',format:'cjs',external:['react'],loader:{'.css':'empty'},jsx:'automatic',nodePaths:[path.resolve('node_modules')]});
 const module={exports:{}};
 new Function('require','module','exports',result.outputFiles[0].text)(require,module,module.exports);
 const {MyBuddy}=module.exports;
 expect(MyBuddy).toBeTypeOf('function');
 for(const state of REACTIONS){
  render(<MyBuddy state={state} size={128} aria-label="Exported buddy" playing={false}/>);
  expect(screen.getByRole('img',{name:'Exported buddy'})).toHaveAttribute('data-state',state);
  expect(screen.getByRole('img')).toHaveAttribute('width','128');cleanup();
 }
 render(<MyBuddy state="unknown" playing={false}/>);
 expect(screen.getByRole('img')).toHaveAttribute('data-state','idle');
 expect(screen.getByRole('img')).toHaveAttribute('width','180');
 expect(await readFile(path.join(dir,'styles.css'),'utf8')).toContain('prefers-reduced-motion');
});
it('rejects invalid component names before emitting executable code',()=>{
 expect(()=>generateFiles(createConfig({componentName:'bad;alert(1)'}))).toThrow(/Component name/);
});
