# Architecture

`createConfig()` construit le contrat courant d’un projet. `validateConfig()` refuse les champs inconnus, les valeurs non prises en charge et les combinaisons incompatibles avant tout import ou export. Cette séparation empêche une entrée externe de modifier silencieusement le dessin demandé.

`renderParts(h, config, state)` assemble la géométrie SVG à partir de trois modules : le modèle des silhouettes, les effets de réaction et le rendu principal. React, l’adaptateur DOM autonome et les exports d’image appellent ces mêmes fonctions. Les éléments de tête et accessoires utilisent des points d’attache propres à chaque silhouette.

`sampleCharacter(config, state, time, look)` est une fonction pure du temps. `mountCharacter()` orchestre `requestAnimationFrame`, le suivi amorti du regard, la pause hors écran, la préférence de mouvement réduit et le nettoyage des ressources. Les exports média réutilisent les mêmes poses sans dépendre du pointeur de l’éditeur.

Le studio conserve les 40 dernières modifications. Une interaction continue, telle qu’un glisser dans le sélecteur de couleur, produit des aperçus transitoires puis une seule entrée d’historique et une seule écriture dans `localStorage`.

Les générateurs copient le preset validé, la géométrie et le moteur dans des fichiers indépendants. Les projets React et Vue utilisent des modules ES ; la livraison JavaScript regroupe le rendu derrière une API globale et inclut une démonstration autonome. Aucun appel distant ni runtime Wobbi n’est nécessaire après export.

`createSvg()` sérialise un SVG isolé. Le PNG le dessine sur canvas, le GIF utilise 54 images à 15 images/s et la vidéo WebM s’appuie sur `MediaRecorder`. Les signaux d’annulation, URLs Blob, pistes, observateurs et écouteurs sont nettoyés dans tous les chemins de sortie.
