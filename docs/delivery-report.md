# Livraison Wobbi V1 — 10 septembre 2026

## Résultat

Studio React/JavaScript/Vite fonctionnel : six presets, cinq formes, yeux et bouche, couleurs/contour/fond/taille, huit réactions SVG, Preview/Grid, contrôles de mouvement, Settings, sauvegarde locale et thème global. Export ZIP/JSON réel, fichiers consultables/copiables, snippets et CLI locale avec protection contre l’écrasement. Symbole de marque aux yeux lisibles, logos clair/sombre et manifestes fournis. Les six images originales sont préservées.

L’application a été réellement démarrée à `http://127.0.0.1:5173`. Les huit écrans ont été inspectés dans Chromium et comparés aux cinq références. Aucun échec final ni erreur console dans les parcours vérifiés.

## Vérifications exécutées

| Commande                   | Résultat final                                                              |
| -------------------------- | --------------------------------------------------------------------------- |
| `npm run test:unit`        | 5 tests réussis                                                             |
| `npm run test:components`  | 7 tests réussis                                                             |
| `npm run test:integration` | 3 tests réussis                                                             |
| `npm run test:contracts`   | 3 tests réussis                                                             |
| `npm run test:cli`         | 9 tests réussis                                                             |
| `npm run test:a11y`        | 2 tests réussis                                                             |
| `npm run test:e2e`         | 4 parcours réussis                                                          |
| `npm run test:visual`      | 8 captures comparées, réussies                                              |
| `npm run test:all`         | Les 8 périmètres ci-dessus exécutés séquentiellement : **41 tests réussis** |
| `npm run test:production`  | Les 4 parcours navigateur réussissent aussi sur le build minifié            |
| `npm run lint`             | Réussi, aucune erreur ni avertissement ESLint                               |
| `npm run format:check`     | Réussi                                                                      |
| `npm run build`            | Réussi, Vite 8.3.0 ; JS 294,22 Ko / 93,06 Ko gzip                           |
| `git diff --check`         | Réussi                                                                      |

Autres vérifications : démarrage Vite réel, agent-browser (chargement, snapshot, captures et erreurs), Axe en navigateur avec contrastes, copie réelle dans le presse-papiers, téléchargement ZIP et compilation de son contenu, contrôle des pixels alpha et dimensions des logos. La police est locale. Aucun test ignoré ou désactivé.

Installation CLI manuelle supplémentaire : les quatre fichiers ont été créés et lus dans `C:/Users/Dell/AppData/Local/Temp/wobbi-final-c6a458da-28c8-421c-90af-58461012ecf5`. Les tests automatisés utilisent leurs propres dossiers temporaires et les nettoient.

## Lancer et tester

```sh
npm run dev
npm run cli -- add ghost-eye --dir ./tmp/my-mascot
```

Pour une destination déjà remplie, choisir un autre dossier ou passer explicitement `--force`. La publication npm n’est pas effectuée ; `npx wobbi@latest …` est uniquement une syntaxe future documentée.

## Principaux fichiers

| Fonctionnalité                                | Chemin                                    |
| --------------------------------------------- | ----------------------------------------- |
| Composition du studio                         | `src/App.jsx`                             |
| Design, Motion, Settings, Preview, sauvegarde | `src/studio/`                             |
| Modèle et validation                          | `packages/core/config.js`                 |
| Formes et expressions SVG                     | `packages/core/render.js`                 |
| Animations et préférences système             | `packages/core/motion.js`                 |
| Génération des quatre fichiers                | `packages/codegen/`                       |
| Registre local                                | `packages/registry/index.js`              |
| CLI                                           | `packages/cli/bin/wobbi.js`               |
| Téléchargements et snippets                   | `src/export/`                             |
| Logos et manifeste de marque                  | `public/brand/`                           |
| Manifeste web                                 | `public/manifest.webmanifest`             |
| Captures finales                              | `tests/visual/studio.spec.js-snapshots/`  |
| Architecture et TDD                           | `docs/architecture.md`, `docs/tdd-log.md` |
| Prompts et variantes du logo                  | `docs/brand.md`                           |

## Décisions et limites

- Modules partagés plutôt qu’un monorepo d’applications séparées. CLI en workspace npm, sources du domaine indépendantes de React et du studio.
- Le générateur copie les sources canoniques via adaptateurs Node / Vite `?raw`. Le code reste valide après minification du studio, et ne dépend ni de localStorage ni d’une API Wobbi.
- JavaScript / JSX uniquement. Next.js ajoute sa directive client ; aucune application Next.js complète n’est incluse dans cette V1.
- Registre local, six presets ; le ZIP ou le JSON transporte les créations personnalisées. Pas de service distant simulé, de compte, de collaboration ni de backend.
- La composition suit les maquettes. Les SVG simplifient leurs artefacts, la cinquième forme et les contrôles supplémentaires allongent le panneau gauche, qui défile indépendamment. L’installation locale explique sa frontière et ajoute un téléchargement réel.
- Auto play est désactivé au premier lancement. Le mode sombre suit toute la surface, et la lecture peut respecter le mouvement réduit et la visibilité.
- Les logos horizontaux ont des fonds opaques clair/sombre explicitement décrits ; seul le symbole est transparent. Les variantes au damier simulé ont été remplacées après audit.
- Captures visuelles de référence propres à Chromium/Windows. Les chemins CLI sont portables, mais macOS/Linux n’ont pas été exécutés sur cette machine Windows.

## Commits

Les commits de spécification précèdent les implémentations correspondantes. Les corrections de vérification et la documentation sont séparées. Le commit contenant le présent rapport est le commit de livraison, dont le hash est donné dans la réponse finale et disponible avec `git log -1 --oneline`.

```text
4c2732c chore(repo): initialize Wobbi workspace and test toolchain
ad7c4c2 test(domain): specify mascot configuration and animation contracts
3dc8bde test(renderer): specify expressions and reduced motion behavior
4fad86b feat(domain): add mascot model and replaceable local registry
0ae39ea feat(renderer): render eight SVG reactions with accessible motion
8c2ffa2 test(codegen): specify generated source compilation and render contracts
1152f3c test(cli): specify local installs conflicts and custom paths
8305a48 feat(codegen): generate standalone editable React and Next.js sources
94fee07 feat(cli): install local mascots with explicit overwrite protection
779b4e9 test(studio): specify design motion settings export and keyboard workflows
c925cc6 feat(studio): implement live design motion settings and local persistence
ccee36f feat(export): ship editable sources and refined Wobbi brand assets
954d0fe test(e2e): cover browser exports motion and visual reference screens
4192396 refactor(core): clarify source modules and verify exported motion cleanup
dd5d39e fix(studio): refine accessible controls and organize panel styles
a2ac8d0 test(verification): lock visual baselines and verify production workflows
cf82afc fix(brand): finalize logo variants and accurate icon manifests
```
