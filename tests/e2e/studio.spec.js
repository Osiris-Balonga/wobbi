import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {build} from 'esbuild';
import {unzipSync,strFromU8} from 'fflate';
test('creates, animates, saves, exports and restores a mascot',async({page,context})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/');
 await page.getByRole('button',{name:'Preset Blinky'}).click();
 await page.getByRole('button',{name:'Shape Blob'}).click();
 await page.getByRole('button',{name:'Eyes Dots'}).click();
 await page.getByLabel('Body color',{exact:true}).fill('#336699');
 const preview=page.getByTestId('main-preview').getByRole('img');
 await expect(preview.locator('[data-part="body"]')).toHaveAttribute('fill','#336699');
 await page.getByRole('tab',{name:'Grid',exact:true}).click();
 await expect(page.getByTestId('reaction-grid').getByRole('img')).toHaveCount(8);
 await page.getByRole('tab',{name:'Motion',exact:true}).click();
 await page.getByLabel('Reaction to edit').selectOption('happy');
 await page.getByLabel('Duration',{exact:true}).fill('1200');
 await page.getByRole('button',{name:'Once',exact:true}).click();
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await expect(preview).toHaveAttribute('data-state','happy');
 expect(await page.locator('[data-testid="main-preview"] svg').evaluate(el=>el.getAnimations({subtree:true}).length)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await expect.poll(()=>preview.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 await page.getByRole('tab',{name:'Settings',exact:true}).click();
 await page.getByLabel('Mascot name',{exact:true}).fill('Cloud Buddy');
 await page.getByLabel('Component name',{exact:true}).fill('CloudBuddy');
 await page.getByLabel('Default folder',{exact:true}).fill('src/buddies');
 await page.getByLabel('Framework',{exact:true}).selectOption('next');
 await page.getByLabel('Accessible label',{exact:true}).fill('Friendly cloud');
 await page.getByRole('button',{name:'Save settings',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Settings saved');
 await page.getByRole('tab',{name:'Install',exact:true}).click();
 await page.getByRole('button',{name:'Copy command',exact:true}).click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('--framework next');
 await page.getByRole('tab',{name:'Generated Files',exact:true}).click();
 await expect(page.getByRole('button',{name:'View CloudBuddy.jsx'})).toBeVisible();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download source files',exact:true}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('cloud-buddy.zip');
 const files=unzipSync(new Uint8Array(await readFile(await download.path())));
 expect(Object.keys(files).sort()).toEqual(['src/buddies/CloudBuddy.jsx','src/buddies/animations.js','src/buddies/index.js','src/buddies/styles.css']);
 const component=strFromU8(files['src/buddies/CloudBuddy.jsx']);expect(component).toContain('#336699');expect(component).toMatch(/^'use client'/);
 const dir=await mkdtemp(path.join(tmpdir(),'wobbi-browser-export-'));
 try {
   for(const [name,data] of Object.entries(files))await writeFile(path.join(dir,path.basename(name)),data);
   const result=await build({entryPoints:[path.join(dir,'index.js')],bundle:true,write:false,platform:'browser',external:['react','react/jsx-runtime'],loader:{'.css':'empty'},jsx:'automatic'});
   expect(result.outputFiles[0].text).toContain('CloudBuddy');
 } finally {await rm(dir,{recursive:true,force:true});}
 await page.getByRole('tab',{name:'Usage',exact:true}).click();
 for(const label of ['Import','Default','Change reaction','Dynamic state']){
  await page.getByRole('button',{name:`Copy ${label}`,exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('CloudBuddy');
 }
 await page.reload();
 await expect(page.getByRole('heading',{name:'Cloud Buddy',exact:true})).toBeVisible();
 await expect(page.getByTestId('main-preview').getByRole('img')).toHaveAttribute('aria-label','Friendly cloud');
 await page.getByRole('button',{name:'Dark theme',exact:true}).click();
 await expect(page.getByTestId('studio')).toHaveAttribute('data-theme','dark');
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 expect(errors).toEqual([]);
});
test('respects live reduced-motion changes and offscreen pause',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.getByRole('button',{name:'Reaction Happy'}).click();
 await page.getByRole('switch',{name:'Auto play'}).click();
 const svg=page.getByTestId('main-preview').getByRole('img');
 expect(await svg.evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect.poll(()=>svg.evaluate(el=>el.getAnimations({subtree:true}).length)).toBeGreaterThan(0);
 await svg.evaluate(el=>{el.style.position='fixed';el.style.top='-1000px';});
 await expect.poll(()=>svg.evaluate(el=>el.getAnimations({subtree:true}).every(a=>a.playState==='paused'))).toBe(true);
});
test('keyboard navigation, docs dialog and real contrast checks',async({page})=>{
 await page.goto('/');
 await page.getByRole('tab',{name:'Design',exact:true}).focus();await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('tab',{name:'Motion',exact:true})).toBeFocused();
 expect(await page.getByRole('tab',{name:'Motion',exact:true}).evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
 for(const name of ['Design','Motion','Settings','Generated Files','Usage']){
  await page.getByRole('tab',{name,exact:true}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 }
 await page.getByRole('button',{name:'Docs',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('small screen keeps customization, preview and export reachable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByTestId('main-preview')).toBeVisible();
 await page.getByRole('button',{name:'Customize',exact:true}).click();
 await page.getByRole('button',{name:'Preset Mochi'}).click();
 await page.getByRole('navigation',{name:'Workspace panels'}).getByRole('button',{name:'Preview',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Mochi',exact:true})).toBeVisible();
 await page.getByRole('navigation',{name:'Workspace panels'}).getByRole('button',{name:'Export',exact:true}).click();
 await expect(page.getByRole('button',{name:'Copy command',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
