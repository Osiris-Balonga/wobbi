# Identité Wobbi

Le logo original est conservé à la racine. La graphie « Mobbi » a été corrigée en **Wobbi**, conformément au brief. Le symbole conserve la silhouette noire, le décalage lavande et les deux yeux blancs. Les pupilles ont été réduites et séparées pour que les yeux restent lisibles.

## Fichiers livrés

| Fichier dans `public/brand` | Usage                                     | Fond                                     |
| --------------------------- | ----------------------------------------- | ---------------------------------------- |
| `wobbi-symbol.png`          | Navbar, favicon et icône du manifeste web | Véritable alpha transparent, 1254 × 1254 |
| `wobbi-wordmark.png`        | Logo horizontal clair, 2048 × 768         | Blanc opaque                             |
| `wobbi-wordmark-dark.png`   | Logo horizontal sombre, 2048 × 768        | Charbon opaque                           |
| `manifest.json`             | Rôles, dimensions, palette et provenance  | JSON                                     |

Le symbole est utilisé avec du texte HTML dans la navbar afin que le nom adopte le thème global. Les logos horizontaux sont des variantes raster à fond explicite, pas des SVG. Le manifeste web et l’icône Apple utilisent le symbole transparent.

## Itérations et contrôle

Toutes les retouches sont réalisées avec l’outil intégré **Imagegen**, sans API payante ajoutée au projet ni traitement d’image Python. Les premiers essais horizontaux simulaient la transparence par un damier. L’audit des pixels a détecté 0 pixel transparent sur ces essais, contre 956 594 pixels transparents sur le symbole. Ces essais n’ont pas été conservés comme livrables finaux ; les variantes horizontales finales ont des fonds opaques explicites. Les dimensions réelles du symbole sont reportées dans le manifeste, plutôt qu’une taille supposée.

## Prompts finaux

Symbole :

> Edit this logo into a square app icon version, symbol only, remove all lettering. Keep exactly the same friendly black pebble with lavender silhouette offset behind upper left and two clearly separated white oval eyes with small black pupils. Flat solid colors #111218 #9270ff white, crisp clean edges, no texture, no shading. Center large symbol with 10% clear padding on genuinely transparent background. This is Wobbi's companion mark for app icons and favicon.

Logo clair :

> Edit target: Wobbi logo. Replace EVERY gray checkerboard area with perfectly flat PURE WHITE #ffffff. Use an OPAQUE solid white background, NO transparency and absolutely NO checkerboard pattern. Keep exactly the black Wobbi lettering and lavender dot, friendly black pebble mascot, separated large white eyes and small pupils, purple silhouette. Preserve the logo composition. Flat colors, clean edges, no texture, no lighting, no paper effect. Deliver the finished horizontal black-and-purple Wobbi logo on solid white.

Logo sombre :

> Edit target: white Wobbi logo for dark surfaces. Replace EVERY gray checkerboard area with perfectly flat DARK CHARCOAL #16161e. Use an OPAQUE solid dark charcoal background, NO transparency and absolutely NO checkerboard pattern. Preserve the white Wobbi lettering, lavender i dot, friendly black pebble symbol with thin white outline, separated white eyes and small pupils, lavender silhouette. Preserve composition exactly. Flat colors, clean edges, no texture, no lighting, no paper effect. Deliver finished horizontal white-and-purple Wobbi logo on dark charcoal.
