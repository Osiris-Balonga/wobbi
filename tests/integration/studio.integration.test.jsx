import {it,expect} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App.jsx';
it('saves settings, updates exported content and restores the creation',async()=>{
 const user=userEvent.setup();const {unmount}=render(<App/>);
 await user.click(screen.getByRole('tab',{name:'Settings',exact:true}));
 fireEvent.change(screen.getByLabelText('Mascot name'),{target:{value:'Cloud Friend'}});
 fireEvent.change(screen.getByLabelText('Component name'),{target:{value:'CloudFriend'}});
 fireEvent.change(screen.getByLabelText('Default folder'),{target:{value:'src/buddies'}});
 fireEvent.change(screen.getByLabelText('Accessible label'),{target:{value:'Friendly cloud'}});
 await user.click(screen.getByRole('button',{name:'Save settings'}));
 expect(screen.getByRole('status')).toHaveTextContent('Settings saved');
 await user.click(screen.getByRole('tab',{name:'Generated Files'}));
 expect(screen.getByRole('button',{name:'View CloudFriend.jsx'})).toBeInTheDocument();
 expect(screen.getByText('src/buddies/')).toBeInTheDocument();
 unmount();render(<App/>);
 expect(screen.getByRole('heading',{name:'Cloud Friend'})).toBeInTheDocument();
 expect(screen.getByTestId('main-preview').querySelector('svg')).toHaveAttribute('aria-label','Friendly cloud');
});
it('uses the same global theme for the whole shell and persists it',async()=>{
 const user=userEvent.setup();const {unmount}=render(<App/>);
 await user.click(screen.getByRole('button',{name:'Dark theme'}));
 expect(screen.getByTestId('studio')).toHaveAttribute('data-theme','dark');
 expect(screen.getByLabelText('Export panel')).toBeInTheDocument();
 unmount();render(<App/>);expect(screen.getByTestId('studio')).toHaveAttribute('data-theme','dark');
});
it('recovers from corrupt saved data and rejects invalid settings',async()=>{
 localStorage.setItem('wobbi.studio.v1','{broken');
 const user=userEvent.setup();render(<App/>);
 expect(screen.getByRole('heading',{name:'GhostEye'})).toBeInTheDocument();
 await user.click(screen.getByRole('tab',{name:'Settings',exact:true}));
 fireEvent.change(screen.getByLabelText('Component name'),{target:{value:'bad-name'}});
 await user.click(screen.getByRole('button',{name:'Save settings'}));
 expect(screen.getByRole('alert')).toHaveTextContent('Component name');
 await user.click(screen.getByRole('button',{name:'Reset defaults'}));
 expect(screen.getByLabelText('Component name')).toHaveValue('GhostEye');
});
