import {test,expect} from '@playwright/test';
const screens=[
 ['design-preview',null,null],['design-grid','Grid',null],['motion','Motion',null],['settings','Settings',null],
 ['export-install','Install',null],['export-files','Generated Files',null],['export-usage','Usage',null],['dark','Grid','dark'],
];
for(const [name,tab,theme] of screens){
 test(name,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  if(tab)await page.getByRole('tab',{name:tab,exact:true}).click();
  if(tab==='Motion')await page.getByLabel('Reaction to edit').selectOption('happy');
  if(theme)await page.getByRole('button',{name:'Dark theme'}).click();
  await expect(page).toHaveScreenshot(`${name}.png`,{fullPage:true});
 });
}
