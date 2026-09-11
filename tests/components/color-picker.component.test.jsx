import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';
import { ColorPicker } from '../../src/studio/ColorPicker.jsx';

it('keeps precise keyboard input and follows an external colour change', () => {
  const onChange = vi.fn();
  function Harness() {
    const [value, setValue] = useState('#111218');
    return (
      <>
        <ColorPicker
          value={value}
          label="Corps"
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
          onClose={vi.fn()}
        />
        <button type="button" onClick={() => setValue('#ffffff')}>
          Couleur externe
        </button>
      </>
    );
  }
  render(<Harness />);
  fireEvent.change(screen.getByLabelText('Teinte'), {
    target: { value: '3' },
  });
  expect(screen.getByLabelText('Teinte')).toHaveValue('3');
  expect(onChange).toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Couleur externe' }));
  expect(screen.getByLabelText('HEX')).toHaveValue('#FFFFFF');
});
