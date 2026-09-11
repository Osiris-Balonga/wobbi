# Wobbi

Studio web local pour créer, animer et exporter une mascotte réutilisable. Le rendu SVG, les aperçus et les exports partagent le même moteur afin de conserver la forme, les couleurs et la profondeur choisies.

## Prérequis

- Node.js 24
- npm 10 ou une version compatible avec le lockfile

## Démarrer

```sh
npm ci
npm run dev
```

Le studio est disponible sur http://127.0.0.1:5173.

## Fonctionnalités

- 8 silhouettes, 12 regards, 8 bouches, détails de tête et accessoires compatibles avec chaque forme.
- Profondeur plate, douce ou profonde, couleurs indépendantes et fond personnalisable.
- 10 réactions animées, suivi du regard, pause et respect de la préférence système de réduction des animations.
- Historique de 40 modifications et sauvegarde locale.
- Import JSON strict des projets au format courant.
- Exports React, Vue, JavaScript autonome, PNG, SVG, GIF, WebM et projet JSON.

Les aperçus exportés utilisent la couleur de fond du projet. La transparence reste un choix réservé aux formats d’image qui la prennent en charge.

## Intégrer un export

Le ZIP React contient un composant, ses styles, le preset et les modules de rendu et d’animation. Il peut aussi être utilisé comme composant client dans Next.js.

```jsx
import { Wobbi } from './mascot';

<Wobbi state="loading" size={160} interactive playing />;
```

Le ZIP JavaScript contient une démonstration autonome ouvrable directement depuis `index.html` et une API sans dépendance à React :

```js
const mascot = window.WobbiMascot.createMascot(
  document.querySelector('#mascot'),
);

mascot.setState('loading');
mascot.setPlaying(false);
mascot.destroy();
```

## Vérifier

```sh
npm run check
npm run test:production
npm run test:visual
```

`npm run check` vérifie le formatage, ESLint, les tests unitaires, composants, intégration, contrats, CLI et accessibilité, puis produit le bundle de production. Les scénarios Playwright couvrent les parcours navigateur et les fichiers téléchargés.

## Architecture

- `packages/core` : contrat de configuration, géométrie SVG et moteur d’animation.
- `packages/codegen` : génération des livrables React, Vue et JavaScript.
- `packages/registry` et `packages/cli` : presets locaux et installation en ligne de commande.
- `src/studio` : personnalisation, scène, couleurs et historique.
- `src/export` : dialogue d’export et encodage des médias.
- `public/brand` : ressources de marque utilisées par l’interface.

Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour le workflow de contribution et [docs/architecture.md](./docs/architecture.md) pour les responsabilités des modules.
