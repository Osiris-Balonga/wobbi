import { it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App.jsx';
import { createConfig } from '../../packages/core/config.js';
it('persists the current creation and reopens it without replacing the brand logo', () => {
  const first = render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 5 formes de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Forme : Goutte', exact: true }),
  );
  fireEvent.change(screen.getByLabelText('Nom de la mascotte'), {
    target: { value: 'Petite pluie' },
  });
  first.unmount();
  const second = render(<App />);
  expect(screen.getByLabelText('Nom de la mascotte')).toHaveValue(
    'Petite pluie',
  );
  expect(
    second.container.querySelector('.mascot-hit [data-shape]'),
  ).toHaveAttribute('data-shape', 'drop');
  expect(
    screen.getByRole('img', { name: 'Wobbi', exact: true }),
  ).toHaveAttribute('src', '/brand/wobbi-wordmark.png');
});
it('recovers safely from malformed current storage', () => {
  localStorage.setItem('wobbi.studio.v2', 'invalid JSON');
  render(<App />);
  expect(screen.getByLabelText('Nom de la mascotte')).toHaveValue('Wobbi');
});
it('does not normalize unsupported fields from local storage', () => {
  localStorage.setItem(
    'wobbi.studio.v2',
    JSON.stringify({
      config: { ...createConfig(), name: 'À ignorer', retiredSetting: true },
    }),
  );
  render(<App />);
  expect(screen.getByLabelText('Nom de la mascotte')).toHaveValue('Wobbi');
});
it('rejects unsupported project fields before changing the creation', async () => {
  render(<App />);
  const input = screen.getByLabelText('Importer un projet Wobbi');
  const invalid = {
    ...createConfig(),
    name: 'Projet obsolète',
    export: {
      folder: 'src/components/mascot',
      framework: 'react',
      format: 'cjs',
    },
  };
  fireEvent.change(input, {
    target: {
      files: [
        new File([JSON.stringify(invalid)], 'project.json', {
          type: 'application/json',
        }),
      ],
    },
  });
  expect(
    await screen.findByText('Ce projet contient des valeurs invalides.'),
  ).toBeInTheDocument();
  expect(screen.getByLabelText('Nom de la mascotte')).toHaveValue('Wobbi');
});
it('restores the brand preset through an undoable action', () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 5 formes de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Forme : Nuage', exact: true }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Repartir de Wobbi' }));
  expect(
    screen.getByRole('button', { name: 'Forme : Wobbi', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(
    screen.getByRole('button', { name: 'Annuler la modification' }),
  );
  expect(
    screen.getByRole('button', { name: 'Forme : Nuage', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});
