import { it, expect } from 'vitest';
import { act, render, screen, fireEvent, within } from '@testing-library/react';
import App from '../../src/App.jsx';
it('opens with the unchanged full logo and its live brand mascot', () => {
  const { container } = render(<App />);
  expect(
    screen.getByRole('img', { name: 'Wobbi', exact: true }),
  ).toHaveAttribute('src', '/brand/wobbi-wordmark.png');
  expect(container.querySelector('.mascot-hit [data-shape]')).toHaveAttribute(
    'data-shape',
    'wobbi',
  );
  expect(
    screen.getByRole('button', { name: 'Mettre en pause' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('tab', { name: 'Settings' }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Yeux : Grands yeux' }),
  ).toHaveStyle({ '--choice-surface': '#111218', '--choice-ink': '#ffffff' });
  expect(screen.getByRole('button', { name: 'Bouche : Sourire' })).toHaveStyle({
    '--choice-surface': '#111218',
    '--choice-ink': '#ffffff',
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence du corps', exact: true }),
  );
  expect(
    within(
      screen.getByRole('group', { name: 'Couleur du corps' }),
    ).getAllByRole('button'),
  ).toHaveLength(6);
  const studioActions = screen.getByRole('navigation', {
    name: 'Actions du studio',
  });
  expect(
    within(studioActions).getByRole('button', { name: 'Importer un projet' }),
  ).toBeInTheDocument();
  expect(
    within(studioActions).getByRole('button', { name: 'Repartir de Wobbi' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('Un petit personnage. Tout vous.')).toBeNull();
  expect(screen.queryByText('Ouvrir un projet')).toBeNull();
});
it('previews white feature colours against the selected body colour', () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence du corps', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur du corps #ffcc45',
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Teinte de la bouche', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur de la bouche #ffffff',
      exact: true,
    }),
  );
  const mouthChoice = screen.getByRole('button', {
    name: 'Bouche : Sourire',
    exact: true,
  });
  expect(mouthChoice).toHaveStyle({
    '--choice-surface': '#ffcc45',
    '--choice-ink': '#111218',
  });
  expect(mouthChoice.querySelector('[data-part="mouth"] path')).toHaveAttribute(
    'stroke',
    '#ffffff',
  );
});
it('keeps each face preview focused on the feature being chosen', () => {
  const { container } = render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 3 nez de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Nez, museau ou bec : Museau',
      exact: true,
    }),
  );
  const eyeChoice = screen.getByRole('button', {
    name: 'Yeux : Grands yeux',
    exact: true,
  });
  expect(eyeChoice.querySelector('[data-part="nose"]')).toBeNull();
  expect(eyeChoice.querySelector('[data-part="brows"]')).toBeNull();
  expect(eyeChoice.querySelector('[data-part="mouth"]')).toBeNull();

  const browChoice = screen.getByRole('button', {
    name: 'Sourcils : Doux',
    exact: true,
  });
  expect(browChoice.querySelector('[data-part="eyes"]')).toBeTruthy();
  expect(browChoice.querySelector('[data-part="brows"]')).toBeTruthy();
  expect(browChoice.querySelector('[data-part="nose"]')).toBeNull();
  expect(browChoice.querySelector('[data-part="mouth"]')).toBeNull();

  const mouthChoice = screen.getByRole('button', {
    name: 'Bouche : Sourire',
    exact: true,
  });
  expect(mouthChoice.querySelector('[data-part="mouth"]')).toBeTruthy();
  expect(mouthChoice.querySelector('[data-part="nose"]')).toBeNull();
  expect(mouthChoice.querySelector('[data-part="brows"]')).toBeNull();
  expect(
    container.querySelector('.mascot-hit [data-part="nose"]'),
  ).toBeTruthy();
});
it('customizes illustrated parts and reverses an accessory edit', () => {
  const { container } = render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Forme : Rond', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 9 regards de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Yeux : Points', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence des yeux', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur des yeux #9270ff',
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Bouche : Sourire', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Teinte de la bouche', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur de la bouche #61a9ff',
      exact: true,
    }),
  );
  expect(container.querySelector('.mascot-hit [data-eyes]')).toHaveAttribute(
    'data-eyes',
    'dots',
  );
  expect(
    container.querySelector('.mascot-hit [data-part="eyes"] ellipse'),
  ).toHaveAttribute('fill', '#9270ff');
  expect(
    container.querySelector('.mascot-hit [data-part="mouth"]'),
  ).toBeTruthy();
  expect(
    container.querySelector('.mascot-hit [data-part="mouth"] path'),
  ).toHaveAttribute('stroke', '#61a9ff');
  const details = screen.getByRole('button', { name: /Accessoires & détails/ });
  fireEvent.click(details);
  expect(details).toHaveAttribute('aria-expanded', 'true');
  expect(
    screen.getByRole('heading', { name: /À vous de jouer/ }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: /Voir \d+ détails de tête de plus/,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Tête : Oreilles de chat',
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Accessoires : Lunettes', exact: true }),
  );
  expect(
    container.querySelector('.mascot-hit [data-part="ear-0"]'),
  ).toBeTruthy();
  expect(
    container.querySelector('.mascot-hit [data-part="accessory"]').children
      .length,
  ).toBeGreaterThan(0);
  fireEvent.click(
    screen.getByRole('button', { name: 'Annuler la modification' }),
  );
  expect(
    container.querySelector('.mascot-hit [data-part="accessory"]').children
      .length,
  ).toBe(0);
});
it('expands and reduces the compact shape, eye and mouth grids', () => {
  render(<App />);
  expect(
    screen.queryByRole('button', {
      name: 'Forme : Carré arrondi',
      exact: true,
    }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 5 formes de plus', exact: true }),
  );
  expect(
    screen.getByRole('button', { name: 'Forme : Ovale', exact: true }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Forme : Œuf', exact: true }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Forme : Triangle', exact: true }),
  ).not.toBeInTheDocument();
  expect(document.querySelector('.choice-grid.columns-3')).toBeTruthy();
  fireEvent.click(
    screen.getByRole('button', { name: 'Réduire forme', exact: true }),
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 9 regards de plus', exact: true }),
  );
  expect(
    screen.getByRole('button', { name: 'Yeux : Pixels', exact: true }),
  ).toBeInTheDocument();
  const eyelidChoice = screen.getByRole('button', {
    name: 'Yeux : Paupières',
    exact: true,
  });
  expect(
    within(eyelidChoice).getByRole('img', { hidden: true }),
  ).toHaveAttribute('data-state', 'idle');
  expect(eyelidChoice.querySelector('[data-eyes]')).toHaveAttribute(
    'data-eyes',
    'sleepy',
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Réduire yeux', exact: true }),
  );

  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 5 bouches de plus', exact: true }),
  );
  expect(
    screen.getByRole('button', { name: 'Bouche : Deux dents', exact: true }),
  ).toBeInTheDocument();
});
it('shows and applies both eye tones only for eye families that use pupils', () => {
  const { container } = render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence des yeux', exact: true }),
  );
  expect(
    screen.getByRole('group', { name: 'Couleur de l’œil' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('group', { name: 'Couleur des pupilles' }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur des pupilles #9270ff',
      exact: true,
    }),
  );
  expect(
    container.querySelector('.mascot-hit [data-part="pupil"] ellipse'),
  ).toHaveAttribute('fill', '#9270ff');
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 9 regards de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Yeux : Points', exact: true }),
  );
  expect(
    screen.getByRole('group', { name: 'Couleur des yeux' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('group', { name: 'Couleur des pupilles' }),
  ).not.toBeInTheDocument();
});
it('offers a lash colour only for eye families that draw lashes', () => {
  const { container } = render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 9 regards de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Yeux : Paupières', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence des yeux', exact: true }),
  );
  expect(
    screen.getByRole('group', { name: 'Couleur des cils' }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur des cils #9270ff',
      exact: true,
    }),
  );
  expect(
    container.querySelector('.mascot-hit [data-eye-lash="sleepy"]'),
  ).toHaveAttribute('stroke', '#9270ff');
  fireEvent.click(
    screen.getByRole('button', { name: 'Yeux : Points', exact: true }),
  );
  expect(
    screen.queryByRole('group', { name: 'Couleur des cils' }),
  ).not.toBeInTheDocument();
});
it('can collapse a choice grid while an extra option is selected', () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 3 nez de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Nez, museau ou bec : Museau',
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Réduire nez, museau ou bec',
      exact: true,
    }),
  );
  expect(
    screen.getByRole('button', {
      name: 'Nez, museau ou bec : Museau',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByRole('button', { name: 'Voir 3 nez de plus', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
});
it.each(['Museau', 'Bec'])(
  'keeps mouth choices visible but disabled with %s',
  (label) => {
    render(<App />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Bouche : Sourire', exact: true }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Voir 3 nez de plus', exact: true }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: `Nez, museau ou bec : ${label}`,
        exact: true,
      }),
    );
    expect(
      screen.getByRole('button', { name: 'Bouche : Sans', exact: true }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Bouche : Sans', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Bouche : Sourire', exact: true }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voir 5 bouches de plus',
        exact: true,
      }),
    );
    expect(
      screen.getByRole('button', { name: 'Bouche : Crocs', exact: true }),
    ).toBeDisabled();
  },
);
it('exposes disclosure animation and accessibility state', () => {
  render(<App />);
  const trigger = screen.getByRole('button', {
    name: 'Apparence du corps',
    exact: true,
  });
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  expect(panel).toHaveAttribute('aria-hidden', 'true');
  expect(panel).not.toHaveClass('is-open');
  fireEvent.click(trigger);
  expect(panel).toHaveClass('is-open');
  expect(panel).toHaveAttribute('aria-hidden', 'false');
  fireEvent.click(trigger);
  expect(panel).not.toHaveClass('is-open');
  expect(panel).toHaveAttribute('aria-hidden', 'true');
});
it('only offers details compatible with the selected silhouette', () => {
  render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Forme : Rond', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: /Accessoires & détails/ }),
  );
  expect(screen.queryByText('Petites mains')).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: /Voir \d+ détails de tête de plus/,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Tête : Oreilles de chat',
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Voir 6 accessoires de plus',
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Accessoires : Casque', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Voir 5 formes de plus', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Forme : Carré arrondi',
      exact: true,
    }),
  );
  expect(
    screen.queryByRole('button', {
      name: 'Tête : Oreilles de chat',
      exact: true,
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', {
      name: 'Accessoires : Casque',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByRole('button', { name: 'Tête : Sans', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});
it('accepts an exact colour and opens an export choice without downloading', async () => {
  const { container } = render(<App />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Apparence du corps', exact: true }),
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Couleur du corps personnalisée',
      exact: true,
    }),
  );
  fireEvent.change(screen.getByLabelText('HEX'), {
    target: { value: '#336699' },
  });
  expect(container.querySelector('.mascot-hit [data-shape]')).toHaveAttribute(
    'fill',
    '#336699',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Terminé' }));
  await act(async () => {
    fireEvent.click(
      screen.getByRole('button', { name: 'Exporter', exact: true }),
    );
    await import('../../src/export/ExportDialog.jsx');
  });
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /Site ou application/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByRole('button', { name: /Télécharger les fichiers/ }),
  ).toBeEnabled();
  expect(container.querySelector('img[src="/brand/react.svg"]')).toBeTruthy();
  expect(
    container.querySelector('img[src="/brand/javascript.svg"]'),
  ).toBeTruthy();
});
