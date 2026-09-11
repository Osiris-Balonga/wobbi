# Identité Wobbi

Le symbole associe une silhouette noire, un décalage lavande et deux yeux blancs. Les ressources finales ont un rôle et un fond explicites :

| Fichier                   | Usage                                | Fond              |
| ------------------------- | ------------------------------------ | ----------------- |
| `wobbi-symbol.png`        | Favicon et icône d’application       | Alpha transparent |
| `wobbi-wordmark.png`      | Barre supérieure et surfaces claires | Blanc opaque      |
| `wobbi-wordmark-dark.png` | Surfaces sombres                     | Charbon opaque    |
| `manifest.json`           | Dimensions, couleurs et rôles        | JSON              |

L’interface utilise le logo horizontal clair dans la barre supérieure. Le moteur SVG recompose la mascotte par défaut afin qu’elle reste animable, tandis que les fichiers raster de marque restent inchangés.

La palette de référence est `#111218` pour l’encre, `#9270ff` pour la lavande et `#ffffff` pour les yeux. Les variantes de logo ont un fond opaque explicite ; seul le symbole carré utilise la transparence.
