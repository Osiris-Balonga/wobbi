import {it,expect} from 'vitest';
import {generateFiles} from '../../packages/codegen/node.js';
import {createConfig} from '../../packages/core/config.js';
it('reflects editable configuration and custom component exports',()=>{
 const files=generateFiles(createConfig({componentName:'CloudBuddy',color:'#336699'}));
 expect(files['CloudBuddy.jsx']).toContain('#336699');
 expect(files['index.js']).toContain("export { CloudBuddy } from './CloudBuddy.jsx'");
 expect(files['animations.js']).toContain('function animationPlan');
});
