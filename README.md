# Wobbi

Un studio de mascottes interactives pour développeurs. Choisissez un preset, personnalisez son identité, configurez huit réactions, puis récupérez **du code React qui vous appartient**.

La V1 est une application locale React / JavaScript / Vite, sans compte ni backend. Les cinq captures fournies constituent la référence de composition. Les ressources originales sont conservées à la racine.

## Démarrer

Node.js **22.12+** (ou 24+) et npm. Vérifié sur Windows avec Node 24.18.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite, normalement `http://127.0.0.1:5173`.

```sh
npm run build
npm run test:production
npm run preview
```

## Le studio

- **Design** : six presets, cinq formes, quatre types d’yeux, bouche optionnelle, couleurs du corps/des yeux/du contour, épaisseur, fond uni/dégradé/transparent et taille.
- **Preview / Grid** : aperçu et huit réactions de la même création. Zoom, sélection de réaction, lecture et pause.
- **Motion** : mouvements ordonnés, activation, ajout, Loop / Once, durée, intensité, easing, Play et Replay. Les mouvements sont séquencés dans des groupes SVG distincts.
- **Settings** : identité, nom de composant, dossier, framework, état/taille/lecture par défaut et accessibilité. Le bouton Save settings applique le formulaire ; Reset defaults réinitialise le formulaire avant sauvegarde.
- **Export** : commande locale honnête, consultation/copie des fichiers, téléchargement ZIP et JSON, exemples d’usage copiables.

Les créations et le thème se sauvegardent sur cet appareil dans `wobbi.studio.v1`. L’animation est arrêtée au premier lancement ; Auto play anime la réaction sélectionnée. Les réglages de mouvement respectent les préférences système par défaut.

## CLI locale

Depuis ce workspace :

```sh
npm run cli -- list
npm run cli -- add ghost-eye --dir ./tmp/my-mascot
npm run cli -- add ghost-eye --dir "./tmp/my components" --framework next
npm run cli -- add ghost-eye --dir ./tmp/my-mascot --force
```

Depuis un autre projet, appeler le chemin absolu de `packages/cli/bin/wobbi.js` avec Node. Le dossier de travail de la commande est celui du projet cible.

Pour installer une création personnalisée, téléchargez sa configuration JSON depuis Generated Files :

```sh
node /chemin/vers/wobbi/packages/cli/bin/wobbi.js add --config ./cloud-buddy.json --dir ./src/components/mascot
```

Les conflits sont vérifiés **avant toute écriture**. Sans `--force`, les fichiers existants sont préservés. Les liens symboliques de fichiers et les dossiers ne sont pas écrasés. Les erreurs retournent le code 1 ; une installation réussie retourne 0.

La syntaxe cible `npx wobbi@latest add ghost-eye` est montrée dans le studio sous « Future npm command ». **Ce package n’a pas été publié sur npm.** La CLI du workspace utilise uniquement le registre local de six presets. Elle n’installe pas les modifications du studio à partir du slug d’un preset : utilisez le ZIP ou `--config` pour cela.

## Sources générées

```text
src/components/mascot/
├── GhostEye.jsx
├── animations.js
├── styles.css
└── index.js
```

```jsx
import { GhostEye } from './components/mascot';

<GhostEye />;
<GhostEye state="thinking" size={128} aria-label="Assistant mascot" />;
<GhostEye state={isLoading ? 'loading' : 'happy'} />;
<GhostEye playing={false} />;
```

Les seules dépendances runtime sont React et votre bundler JSX/CSS. Pas de runtime Wobbi, API, stockage ou login dans les fichiers exportés. Les imports `@/…` montrés dans le studio supposent un alias configuré dans votre application ; un chemin relatif fonctionne également. L’option Next.js ajoute `'use client'` au composant.

## Architecture

```text
src/
  studio/       Design, Motion, Settings, preview et état local
  mascot/       Adaptateur React du SVG partagé
  export/       Interface d’export et téléchargement ZIP/JSON
  ui/           Contrôles accessibles et styles partagés
packages/
  core/         Configuration, validation, géométrie, animation
  registry/     Contrat du registre et six presets locaux
  codegen/      Générateur commun, adaptateurs navigateur et Node
  cli/          Exécutable local et tests isolés
tests/          Périmètres séparés ; contrats, navigateur et visuels
public/brand/   Logo, variantes, symbole et manifeste de marque
```

Voir [docs/architecture.md](docs/architecture.md) et [docs/tdd-log.md](docs/tdd-log.md).

## Vérifications

```sh
npx playwright install chromium
npm run test:unit
npm run test:components
npm run test:integration
npm run test:contracts
npm run test:cli
npm run test:a11y
npm run test:e2e
npm run test:visual
npm run test:all
npm run lint
npm run format:check
npm run build
```

`test:all` exécute les huit périmètres dans cet ordre. Playwright lance Vite ou réutilise l’instance locale. Les tests CLI et contrats utilisent des dossiers temporaires ; les parcours navigateur téléchargent un vrai ZIP et compilent les fichiers qu’il contient. Axe vérifie les écrans dans jsdom et les contrastes dans Chromium. Aucun test n’est désactivé.

Les huit références visuelles sont versionnées dans `tests/visual/studio.spec.js-snapshots`. Elles proviennent de Chromium sur Windows à 1440 × 900 ; Playwright distingue les autres plateformes. Sur une autre plateforme, créer et examiner les références avec `npm run test:visual -- --update-snapshots`. Le mouvement est désactivé et la police est servie localement pour stabiliser les captures. Ne pas lancer deux suites Playwright en même temps dans le même dossier de résultats.

## Limites et prochaines étapes

- Registre local uniquement ; la publication npm et un registre distant restent à créer. `localRegistry.list/resolve` constitue la frontière de remplacement.
- JavaScript / JSX uniquement. React est testé ; l’export Next.js utilise sa frontière client, sans application Next.js de démonstration dans ce dépôt.
- Une création par navigateur, pas de stockage cloud, d’historique undo/redo ou de synchronisation entre appareils.
- Priorité desktop. Les panneaux se sélectionnent sur petite largeur et défilent si nécessaire.
- Les mascottes sont des SVG modifiables ; les logos de marque livrés sont des PNG. Le manifeste web est fourni sans service worker ni promesse de fonctionnement hors ligne.
- La géométrie minimaliste reproduit l’esprit des références sans leurs artefacts. Le registre local et les téléchargements ajoutent quelques lignes au panneau Export.

Évolutions possibles : publication de la CLI avec dépendances empaquetées, registre versionné distant, import JSON dans le studio, exports TypeScript, historique d’édition et raccourcis supplémentaires.
