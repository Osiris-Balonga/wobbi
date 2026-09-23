import { createContext, useContext } from 'react';
import { spanish } from './es.js';
import { portugueseBrazil } from './pt-BR.js';
import { simplifiedChinese } from './zh-Hans.js';

export const supportedLocales = ['en', 'fr', 'es', 'pt-BR', 'zh-Hans'];
export const STORAGE_KEY = 'wobbi.locale';
const mascotLabels = {
  en: 'Wobbi mascot',
  fr: 'Mascotte Wobbi',
  es: 'Mascota Wobbi',
  'pt-BR': 'Mascote Wobbi',
  'zh-Hans': 'Wobbi 吉祥物',
};

export function localizedMascotLabel(locale, label) {
  return Object.values(mascotLabels).includes(label)
    ? mascotLabels[locale] || mascotLabels.en
    : label;
}
const metadata = {
  en: {
    title: 'Wobbi — Create and animate your mascot',
    description:
      'Create, animate, and export your Wobbi mascot. Customize its shape, expression, colors, and reactions in your browser.',
    socialDescription:
      'Customize an expressive mascot, animate its reactions, and export it for your projects.',
    imageAlt: 'Wobbi studio with its mascot and customization options',
    structuredDescription:
      'Create, animate, and export an expressive mascot in your browser.',
    ogLocale: 'en_US',
  },
  fr: {
    title: 'Wobbi — Créez et animez votre mascotte',
    description:
      'Créez, animez et exportez votre mascotte Wobbi. Personnalisez sa forme, son regard, ses couleurs et ses réactions directement dans votre navigateur.',
    socialDescription:
      'Personnalisez une mascotte expressive, animez ses réactions et exportez-la pour vos projets.',
    imageAlt:
      'Le studio Wobbi avec sa mascotte et ses options de personnalisation',
    structuredDescription:
      'Créez, animez et exportez une mascotte expressive directement dans votre navigateur.',
    ogLocale: 'fr_FR',
  },
  es: {
    title: 'Wobbi — Crea y anima tu mascota',
    description:
      'Crea, anima y exporta tu mascota Wobbi. Personaliza su forma, expresión, colores y reacciones en el navegador.',
    socialDescription:
      'Personaliza una mascota expresiva, anima sus reacciones y expórtala para tus proyectos.',
    imageAlt: 'Estudio Wobbi con su mascota y opciones de personalización',
    structuredDescription:
      'Crea, anima y exporta una mascota expresiva en el navegador.',
    ogLocale: 'es_ES',
  },
  'pt-BR': {
    title: 'Wobbi — Crie e anime seu mascote',
    description:
      'Crie, anime e exporte seu mascote Wobbi. Personalize a forma, a expressão, as cores e as reações no navegador.',
    socialDescription:
      'Personalize um mascote expressivo, anime suas reações e exporte para seus projetos.',
    imageAlt: 'Estúdio Wobbi com mascote e opções de personalização',
    structuredDescription:
      'Crie, anime e exporte um mascote expressivo no navegador.',
    ogLocale: 'pt_BR',
  },
  'zh-Hans': {
    title: 'Wobbi — 创建并设计你的吉祥物动画',
    description:
      '在浏览器中创建、制作动画并导出 Wobbi 吉祥物，自由定制形状、表情、颜色和动作。',
    socialDescription: '定制生动的吉祥物，制作动作动画，并导出到你的项目中。',
    imageAlt: 'Wobbi 工作室的吉祥物和自定义选项',
    structuredDescription: '在浏览器中创建、制作动画并导出生动的吉祥物。',
    ogLocale: 'zh_CN',
  },
};

export function applyDocumentLocale(locale) {
  const copy = metadata[locale] || metadata.en;
  document.documentElement.lang = locale;
  document.title = copy.title;
  const update = (selector, content) =>
    document.querySelector(selector)?.setAttribute('content', content);
  update('meta[name="description"]', copy.description);
  update('meta[property="og:locale"]', copy.ogLocale);
  update('meta[property="og:title"]', copy.title);
  update('meta[property="og:description"]', copy.socialDescription);
  update('meta[property="og:image:alt"]', copy.imageAlt);
  update('meta[name="twitter:title"]', copy.title);
  update('meta[name="twitter:description"]', copy.socialDescription);
  update('meta[name="twitter:image:alt"]', copy.imageAlt);
  const script = document.querySelector('script[type="application/ld+json"]');
  if (script) {
    const data = JSON.parse(script.textContent);
    script.textContent = JSON.stringify({
      ...data,
      description: copy.structuredDescription,
      inLanguage: locale,
    });
  }
}

const french = {
  Language: 'Langue',
  English: 'Anglais',
  French: 'Français',
  'Wobbi — home': 'Wobbi — accueil',
  'Studio actions': 'Actions du studio',
  'Undo change': 'Annuler la modification',
  'Redo change': 'Rétablir la modification',
  'Import a project': 'Importer un projet',
  'Reset to Wobbi': 'Repartir de Wobbi',
  Export: 'Exporter',
  'Star Wobbi on GitHub': 'Laisser une étoile au dépôt Wobbi sur GitHub',
  'Support Wobbi on GitHub': 'Soutenir Wobbi sur GitHub',
  Star: 'Une étoile',
  'This file is too large.': 'Ce fichier est trop volumineux.',
  'Choose a valid Wobbi project.': 'Choisissez un projet Wobbi valide.',
  'This project contains invalid values.':
    'Ce projet contient des valeurs invalides.',
  'Your creation is ready.': 'Votre création est prête.',
  'This file is not a valid JSON project.':
    'Ce fichier n’est pas un projet JSON valide.',
  'Here is Wobbi, as seen in the logo.': 'Voici Wobbi, comme dans le logo.',
  'Import a Wobbi project': 'Importer un projet Wobbi',
  'Preparing the export…': 'Préparation de l’export…',
  'Local storage is unavailable. Export the project to keep it.':
    'Enregistrement local indisponible. Exportez le projet pour le conserver.',
  'Customize your mascot': 'Personnalisation',
  'Make it yours': 'À vous de jouer',
  'A few choices, your character.': 'Quelques choix, votre personnage.',
  Name: 'Nom',
  'Mascot name': 'Nom de la mascotte',
  Shape: 'Forme',
  shape: 'forme',
  shapes: 'formes',
  'Body appearance': 'Apparence du corps',
  Hue: 'Teinte',
  'Body color': 'Couleur du corps',
  'Body depth': 'Volume du corps',
  Depth: 'Volume',
  Flat: 'Plat',
  Soft: 'Doux',
  Deep: 'Profond',
  Outline: 'Contour',
  'Outline color': 'Couleur du contour',
  Thickness: 'Épaisseur',
  'Body outline thickness': 'Épaisseur du contour du corps',
  Eyes: 'Yeux',
  'eye style': 'regard',
  'eye styles': 'regards',
  'Eye appearance': 'Apparence des yeux',
  'Eye color': 'Couleur de l’œil',
  'Eyes color': 'Couleur des yeux',
  Pupil: 'Pupille',
  'Pupil color': 'Couleur des pupilles',
  Lashes: 'Cils',
  'Lash color': 'Couleur des cils',
  'Eye outline color': 'Couleur du contour des yeux',
  'Eye outline thickness': 'Épaisseur du contour des yeux',
  'Nose, muzzle or beak': 'Nez, museau ou bec',
  nose: 'nez',
  noses: 'nez',
  'Nose hue': 'Teinte du nez',
  'Nose color': 'Couleur du nez',
  Eyebrows: 'Sourcils',
  eyebrow: 'sourcil',
  eyebrows: 'sourcils',
  'Eyebrow hue': 'Teinte des sourcils',
  'Eyebrow color': 'Couleur des sourcils',
  Mouth: 'Bouche',
  mouth: 'bouche',
  mouths: 'bouches',
  'Mouth hue': 'Teinte de la bouche',
  'Mouth color': 'Couleur de la bouche',
  Nose: 'Nez',
  'Accessories & details': 'Accessoires & détails',
  Head: 'Tête',
  'head detail': 'détail de tête',
  'head details': 'détails de tête',
  Accessories: 'Accessoires',
  accessory: 'accessoire',
  accessories: 'accessoires',
  'Detail colors': 'Couleurs des détails',
  'Transparent preview background': 'Fond transparent dans l’aperçu',
  Body: 'Corps',
  Pupils: 'Pupilles',
  'Brow color': 'Couleur des sourcils',
  'Body outline': 'Contour du corps',
  'Eye outline': 'Contour des yeux',
  Accessory: 'Accessoire',
  Accent: 'Accent',
  Background: 'Fond',
  'Show {count} more {item}': 'Voir {count} {item} de plus',
  'Show fewer {item}': 'Réduire {item}',
  Color: 'Couleur',
  'Custom color': 'Couleur personnalisée',
  'Custom {label}': '{label} personnalisée',
  'Custom color: {label}': 'Couleur personnalisée : {label}',
  'Six digits after #.': 'Six chiffres après #.',
  Done: 'Terminé',
  Saturation: 'Saturation',
  Brightness: 'Luminosité',
  'Reaction: {label}': 'Réaction : {label}',
  'Mascot preview': 'Aperçu de votre mascotte',
  'Pause animation': 'Mettre en pause',
  'Animate mascot': 'Animer la mascotte',
  'Make the mascot react': 'Faire réagir la mascotte',
  'Make it react': 'Faites-le réagir',
  Less: 'Moins',
  'See all': 'Tout voir',
  'Website or app': 'Site ou application',
  'An interactive mascot': 'Une mascotte interactive',
  'PNG or SVG': 'PNG ou SVG',
  'GIF or video': 'GIF ou vidéo',
  'Wobbi project': 'Projet Wobbi',
  'Edit it again later': 'Pour la modifier plus tard',
  '{file} copied.': '{file} copié.',
  'Could not copy this file. You can select its contents.':
    'Impossible de copier ce fichier. Vous pouvez sélectionner son contenu.',
  'Check the component name and folder in advanced options.':
    'Vérifiez le nom du composant et le dossier dans les options avancées.',
  'Project saved. You can reopen it in Wobbi.':
    'Projet enregistré. Vous pourrez le rouvrir dans Wobbi.',
  'Your mascot is ready!': 'Votre mascotte est prête !',
  'Export failed. Please try again.':
    'L’export a échoué. Vous pouvez réessayer.',
  'Video · WebM': 'Vidéo · WebM',
  'Reusable React component, also compatible with Next.js client components.':
    'Composant React réutilisable, également compatible avec un composant client Next.js.',
  'Reusable Vue component and modules, ready to import into an existing app.':
    'Composant Vue réutilisable et modules associés, prêts à importer dans une application existante.',
  'Standalone HTML demo: open index.html directly, without a local server.':
    'Démo HTML autonome : ouvrez index.html directement, même sans serveur local.',
  'Export your mascot': 'Exporter votre mascotte',
  'Choose how you want to use it.':
    'Choisissez comment vous voulez l’utiliser.',
  'Close export dialog': 'Fermer l’export',
  Format: 'Format',
  Dimensions: 'Dimensions',
  'Component name': 'Nom du composant',
  'Advanced options': 'Options avancées',
  'Suggested folder': 'Dossier conseillé',
  'Save the shapes, colors, accessories, and reactions of your creation to continue editing it in Wobbi later.':
    'Conservez les formes, couleurs, accessoires et réactions de votre création pour la reprendre plus tard dans Wobbi.',
  Expression: 'Expression',
  'Reaction to record': 'Réaction à enregistrer',
  'The file keeps the transparent background selected in the studio.':
    'Le fichier conserve le fond transparent choisi dans le studio.',
  'The file keeps the background color selected in the studio.':
    'Le fichier conserve la couleur de fond choisie dans le studio.',
  'A 3.6-second sequence on a transparent background. The GIF loops.':
    'Séquence de 3,6 secondes sur fond transparent. Le GIF se répète.',
  'A 3.6-second sequence with the studio background. The GIF loops.':
    'Séquence de 3,6 secondes avec le fond du studio. Le GIF se répète.',
  'Your editable creation': 'Votre création, rééditable',
  'Selected pose': 'La pose sélectionnée',
  'Reaction preview': 'Aperçu de la réaction',
  'Exported code': 'Code exporté',
  'Exported files': 'Fichiers exportés',
  Files: 'Fichiers',
  Copied: 'Copié',
  Copy: 'Copier',
  'Export progress': 'Progression de l’export',
  'Your creation belongs to you.': 'Votre création vous appartient.',
  Cancel: 'Annuler',
  'Preparing…': 'Préparation…',
  'Download files': 'Télécharger les fichiers',
  'Download image': 'Télécharger l’image',
  'Download animation': 'Télécharger l’animation',
  'Save project': 'Enregistrer le projet',
  'Could not create this image.': 'Impossible de créer cette image.',
  'Export canceled': 'Export annulé',
  'This browser cannot export video. Choose GIF.':
    'Ce navigateur ne permet pas cet export vidéo. Choisissez GIF.',
  'Video encoding failed.': 'L’encodage vidéo a échoué.',
};

export function resolveLocale(preferences = []) {
  for (const preference of preferences) {
    const tag = String(preference).toLowerCase().replaceAll('_', '-');
    const language = tag.split('-')[0];
    if (language === 'zh' && !/\b(tw|hk|mo|hant)\b/.test(tag)) return 'zh-Hans';
    if (language === 'pt') return 'pt-BR';
    if (['en', 'fr', 'es'].includes(language)) return language;
  }
  return 'en';
}

export const messageCatalogs = {
  fr: french,
  es: spanish,
  'pt-BR': portugueseBrazil,
  'zh-Hans': simplifiedChinese,
};

export function translate(locale, key, values = {}) {
  const messages = messageCatalogs[locale];
  const template = messages?.[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    String(values[name] ?? ''),
  );
}

export function formatChoiceCount(locale, count, labels) {
  const category = new Intl.PluralRules(locale).select(count);
  const item =
    typeof labels === 'string' ? labels : labels[category] || labels.other;
  return translate(locale, 'Show {count} more {item}', {
    count: new Intl.NumberFormat(locale).format(count),
    item,
  });
}

// Standalone component renders retain the original French labels; the app always uses LocaleProvider.
export const LocaleContext = createContext({
  locale: 'fr',
  setLocale: () => {},
  t: (key, values) => translate('fr', key, values),
});

export function useLocale() {
  return useContext(LocaleContext);
}
