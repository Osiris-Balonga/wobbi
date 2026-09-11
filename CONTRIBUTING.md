# Contribuer à Wobbi

## Installation

Utilisez Node.js 22, puis installez exactement les dépendances verrouillées :

```sh
npm ci
```

Créez une branche courte et explicite (`feature/...`, `fix/...` ou `release/...`). Ne mélangez pas une mise à jour fonctionnelle avec des changements sans rapport.

## Qualité requise

Avant une pull request :

```sh
npm run check
npm run test:production
npm run test:visual
```

Les changements d’interface doivent inclure les tests de comportement pertinents. Mettez à jour une capture de référence uniquement après inspection visuelle du résultat, jamais pour faire disparaître un échec inexpliqué.

Les imports de projet sont des entrées non fiables : validez toujours le document brut avant de construire une configuration. Les exports doivent rester autonomes et conserver le même rendu que le studio.

## Pull requests

Décrivez le problème, la solution, les vérifications effectuées et les impacts visuels. Une pull request doit être limitée, relisible et verte dans la CI avant fusion.
