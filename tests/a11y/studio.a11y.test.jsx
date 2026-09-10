import {it,expect} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from 'jest-axe';
import App from '../../src/App.jsx';
it('has no axe violations across Design, Motion, Settings and export tabs',async()=>{
 const user=userEvent.setup();const {container}=render(<App/>);
 for(const tab of ['Design','Motion','Settings','Generated Files','Usage']){
  await user.click(screen.getByRole('tab',{name:tab,exact:true}));
  expect((await axe(container)).violations).toEqual([]);
 }
},20000);
it('supports keyboard tabs and labelled switches',async()=>{
 const user=userEvent.setup();render(<App/>);
 const design=screen.getByRole('tab',{name:'Design',exact:true});design.focus();
 await user.keyboard('{ArrowRight}');
 expect(screen.getByRole('tab',{name:'Motion',exact:true})).toHaveFocus();
 expect(screen.getByRole('tab',{name:'Motion',exact:true})).toHaveAttribute('aria-selected','true');
 expect(screen.getByRole('switch',{name:'Auto play'})).toHaveAttribute('aria-checked','false');
});
