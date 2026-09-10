# Architecture de Wobbi V1

## Flux de données

`Design → configuration validée → rendu SVG` et `configuration → générateur → fichiers sources` partagent le même modèle. La réaction visualisée est indépendante de la réaction par défaut exportée. Les réglages Motion modifient `config.reactions[reaction]` ; Settings travaille sur un brouillon validé à la sauvegarde.

Le hook `useStudio` détient la configuration et le thème. Les actions enregistrent une version JSON dans localStorage. Les données absentes ou corrompues restaurent les valeurs par défaut ; un stockage indisponible ne bloque pas l’édition et affiche un message demandant de télécharger la création.

## Domaine et rendu

`packages/core/config.js` définit huit états, les valeurs par défaut, les slugs, la validation et les plans d’animation. Durée : 200–5000 ms. Intensité : 0–100. Taille : 48–512 px. Contour : 0–16 px.

`render.js` décrit les formes et expressions avec les primitives SVG de React. `motion.js` applique le plan via Web Animations API, écoute les changements de `prefers-reduced-motion` et utilise IntersectionObserver pour suspendre les animations hors écran. Le nettoyage annule toutes les animations et retire les écouteurs/observateurs. Chaque transformation corporelle dispose de son groupe SVG ; yeux et bouche utilisent leurs groupes dédiés. Les offsets et délais répartissent les mouvements selon l’ordre configuré, sans timeline graphique.

## Génération

`packages/codegen/generate.js` est commun au navigateur et à Node. Les adaptateurs chargent le **texte source canonique**, via les imports Vite `?raw` côté navigateur et le filesystem côté Node. On ne sérialise jamais une fonction minifiée avec `Function.toString()` : le build du studio ne peut donc pas renommer les références dans le code exporté.

Le générateur valide le modèle puis écrit exactement quatre fichiers. Le composant contient sa propre configuration et la géométrie, `animations.js` les fonctions de domaine et le moteur de mouvement, `styles.css` des règles limitées à la classe du slug, et `index.js` l’export nommé. Le code généré utilise les primitives React `createElement` pour la géométrie et une enveloppe JSX lisible. Toutes les formes restent éditables ; aucun moteur opaque n’est requis.

Le ZIP reprend le dossier choisi. Le JSON est un export séparé afin que le ZIP de sources contienne exactement quatre fichiers. La CLI peut installer ce JSON avec `--config`. Le framework Next.js ajoute la directive client ; aucun package Next.js n’est nécessaire pour la génération.

## Registre et CLI

`localRegistry` expose `list()` et `resolve(slug)`. Six presets sont embarqués. Aucun appel réseau ne tente de résoudre une mascotte. Un futur adaptateur distant devra gérer versions, intégrité et erreurs explicitement.

La CLI détermine les chemins via `node:path`, vérifie tous les conflits, crée le dossier puis écrit les fichiers. Les écritures sans force sont exclusives (`wx`) et les nouveaux fichiers sont retirés si une écriture échoue. `--force` autorise le remplacement de fichiers ordinaires ; ce mode n’offre pas de transaction complète en cas de panne disque. Aucune publication n’a été effectuée. Le package CLI est privé et dépend des modules voisins du workspace.

## Interface et accessibilité

La navbar porte l’unique commande Light/Dark. Les trois colonnes héritent des mêmes variables CSS, y compris Export. Les blocs de code restent sombres. Les styles sont organisés par surface, avec les adaptations responsives centralisées.

Les tabs utilisent sélection ARIA, focus mobile et flèches/Home/End. Les champs ont des labels explicitement associés. Les switches et les actions de copie sont nommés ; un statut live annonce les résultats. Les liens de Settings naviguent vers les sections correspondantes. Le dialogue de documentation s’appuie sur `<dialog>` natif pour le focus et Échap. La lecture est arrêtée au premier lancement pour laisser le contrôle à l’utilisateur.

## Validation

Les tests unitaires vérifient le domaine. Les tests de composants vérifient les commandes. Les intégrations vérifient sauvegarde, synchronisation et export. Les contrats écrivent, compilent, importent et rendent le code exporté en isolation. Les tests CLI travaillent dans les dossiers temporaires du système. Playwright vérifie le flux complet, un ZIP réel, les animations, l’accessibilité en navigateur et huit captures stables. Voir `tdd-log.md` pour les RED/GREEN observés.
