import {it,expect,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import {Mascot} from '../../src/mascot/Mascot.jsx';
import {createConfig,REACTIONS} from '../../packages/core/config.js';
it('renders every expression without losing shape and exposes accessible props',()=>{
 const config=createConfig();
 const {rerender}=render(<Mascot config={config} state="idle" size={128} aria-label="My buddy" />);
 for(const state of REACTIONS){
  rerender(<Mascot config={config} state={state} size={128} aria-label="My buddy" />);
  expect(screen.getByRole('img',{name:'My buddy'})).toHaveAttribute('data-state',state);
  expect(screen.getByRole('img')).toHaveAttribute('width','128');
  expect(document.querySelector('[data-part="body"]')).toHaveAttribute('fill',config.color);
 }
 rerender(<Mascot config={config} state="unknown" />);
 expect(screen.getByRole('img')).toHaveAttribute('data-state','idle');
});
it('changes geometry, eyes and mouth from the configuration',()=>{
 const {rerender}=render(<Mascot config={createConfig({shape:'circle',eyes:'dots',mouth:'smile'})} playing={false} />);
 expect(document.querySelector('[data-part="body"]')).toHaveAttribute('data-shape','circle');
 expect(document.querySelector('[data-part="eyes"]')).toHaveAttribute('data-eyes','dots');
 expect(document.querySelector('[data-part="mouth"]')).toBeInTheDocument();
 rerender(<Mascot config={createConfig({mouth:'none'})} playing={false} />);
 expect(document.querySelector('[data-part="mouth"]')).not.toBeInTheDocument();
});
it('does not start motion when paused or reduced motion is requested',()=>{
 window.matchMedia=vi.fn(()=>({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
 render(<Mascot config={createConfig()} state="happy" />);
 expect(Element.prototype.animate).not.toHaveBeenCalled();
});
