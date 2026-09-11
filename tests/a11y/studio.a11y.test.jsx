import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from '../../src/App.jsx';
it('labels the creation, detailed choices and export dialog accessibly', async () => {
  const { container } = render(<App />);
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.click(
    screen.getByRole('button', { name: /Accessoires & détails/ }),
  );
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.click(
    screen.getByRole('button', { name: 'Exporter', exact: true }),
  );
  expect((await axe(container)).violations).toEqual([]);
}, 20000);
it('provides a keyboard-adjustable custom hue', () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence du corps', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur du corps personnalisée',
      exact: true,
    }),
  );
  const hue = screen.getByRole('slider', { name: 'Teinte' });
  expect(hue).toHaveAttribute('type', 'range');
  expect(hue).toHaveAttribute('min', '0');
  expect(hue).toHaveAttribute('max', '359');
  fireEvent.change(hue, { target: { value: '3' } });
  expect(hue).toHaveValue('3');
  expect(screen.getByLabelText('Saturation')).toBeInTheDocument();
});
