import {zipSync,strToU8} from 'fflate';
import {generateFiles} from '../../packages/codegen/browser.js';
export function downloadBlob(blob,name) {
 const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function downloadSources(config) {
 const files=generateFiles(config);
 const entries=Object.fromEntries(Object.entries(files).map(([name,content])=>[`${config.export.folder.replace(/\\/g,'/')}/${name}`,strToU8(content)]));
 downloadBlob(new Blob([zipSync(entries)],{type:'application/zip'}),`${config.slug}.zip`);
}
export function downloadConfig(config) {downloadBlob(new Blob([JSON.stringify(config,null,2)],{type:'application/json'}),`${config.slug}.json`);}
