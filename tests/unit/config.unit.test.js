import {describe,it,expect} from 'vitest';
import {createConfig,validateConfig,normalizeSlug,resolveState,REACTIONS,normalizeMotion,animationPlan} from '../../packages/core/config.js';
describe('mascot domain',()=>{
  it('creates independent complete defaults',()=>{
    const a=createConfig(); const b=createConfig();
    expect(a).toMatchObject({slug:'ghost-eye',name:'GhostEye',componentName:'GhostEye',shape:'ghost',size:256,defaultState:'idle'});
    expect(a.accessibility.respectReducedMotion).toBe(true);
    a.reactions.happy.duration=1300;
    expect(b.reactions.happy.duration).toBe(800);
  });
  it('normalizes human names and rejects unusable configurations',()=>{
    expect(normalizeSlug('  Héllo Buddy! ')).toBe('hello-buddy');
    expect(validateConfig({...createConfig(),componentName:'1-bad'})).toContain('Component name must be a valid PascalCase JavaScript identifier.');
    expect(validateConfig({...createConfig(),color:'url(evil)',size:0,shape:'human'}).length).toBeGreaterThanOrEqual(3);
    expect(validateConfig(createConfig())).toEqual([]);
  });
  it('provides exactly eight reactions with safe fallback',()=>{
    expect(REACTIONS).toEqual(['idle','happy','thinking','surprised','sad','error','success','loading']);
    expect(resolveState('bogus')).toBe('idle');
    expect(resolveState('happy')).toBe('happy');
  });
  it('clamps timing and strength and preserves ordered enabled moves',()=>{
    const motion=normalizeMotion({duration:5,intensity:999,easing:'bad',playback:'bad',movements:[{type:'tilt',enabled:true},{type:'shake',enabled:false},{type:'bounce',enabled:true}]});
    expect(motion).toMatchObject({duration:200,intensity:100,easing:'ease-out',playback:'loop'});
    const plan=animationPlan(motion);
    expect(plan.map(x=>x.type)).toEqual(['tilt','bounce']);
    expect(plan[1].options.delay).toBe(100);
    expect(animationPlan(motion,true)).toEqual([]);
    expect(normalizeMotion({duration:999999,intensity:-2})).toMatchObject({duration:5000,intensity:0});
  });
});
