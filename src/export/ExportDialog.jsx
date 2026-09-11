import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  FilePenLine,
  Image,
  Play,
  X,
} from 'lucide-react';
import { strToU8, zipSync } from 'fflate';
import {
  createConfig,
  normalizeSlug,
  REACTIONS,
  validateConfig,
} from '../../packages/core/config.js';
import {
  generateFiles,
  generateVanillaFiles,
  generateVueFiles,
} from '../../packages/codegen/browser.js';
import { Mascot } from '../mascot/Mascot.jsx';
import { DisclosurePanel } from '../studio/Disclosure.jsx';
import { reactionLabels } from '../studio/catalog.js';
import { downloadBlob } from './download.js';
import {
  createSvg,
  exportGif,
  exportPng,
  exportVideo,
  videoSupported,
} from './media.js';

const kinds = [
  ['code', 'Site ou application', 'Une mascotte interactive', Code2],
  ['image', 'Image', 'PNG ou SVG', Image],
  ['animation', 'Animation', 'GIF ou vidéo', Play],
  ['project', 'Projet Wobbi', 'Pour la modifier plus tard', FilePenLine],
];

function componentName(name) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join('');
  return /^[A-Z]/.test(normalized)
    ? normalized
    : 'Mon' + (normalized || 'Wobbi');
}

function archive(files) {
  return new Blob(
    [
      zipSync(
        Object.fromEntries(
          Object.entries(files).map(([filename, value]) => [
            filename,
            strToU8(value),
          ]),
        ),
      ),
    ],
    { type: 'application/zip' },
  );
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function fileIcon(filename) {
  if (filename.endsWith('.jsx')) return '/brand/react.svg';
  if (filename.endsWith('.vue')) return '/brand/vue.svg';
  if (filename.endsWith('.html')) return '/brand/html.svg';
  if (filename.endsWith('.css')) return '/brand/css.svg';
  if (filename.endsWith('.js')) return '/brand/javascript.svg';
  return '/brand/document.svg';
}

export function ExportDialog({ config, onClose, notify }) {
  const dialog = useRef(null);
  const abort = useRef(null);
  const copyTimer = useRef(null);
  const [kind, setKind] = useState('code');
  const [format, setFormat] = useState('react');
  const [name, setName] = useState(() => componentName(config.name));
  const [state, setState] = useState('idle');
  const [size, setSize] = useState(512);
  const [folder, setFolder] = useState('src/components/mascot');
  const [selectedFile, setSelectedFile] = useState('');
  const [copiedFile, setCopiedFile] = useState('');
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const exportedConfig = useMemo(
    () =>
      createConfig({
        ...config,
        name: config.name.trim() || 'Wobbi',
        slug: normalizeSlug(config.name) || 'wobbi',
        componentName: name,
        export: {
          ...config.export,
          folder,
          framework: format === 'vue' ? 'vue' : 'react',
        },
      }),
    [config, folder, format, name],
  );
  const configErrors = validateConfig(exportedConfig);
  const codeFiles = useMemo(() => {
    if (kind !== 'code' || configErrors.length) return {};
    if (format === 'javascript') return generateVanillaFiles(exportedConfig);
    if (format === 'vue') return generateVueFiles(exportedConfig);
    return generateFiles(exportedConfig);
  }, [exportedConfig, format, kind, configErrors.length]);
  const filenames = Object.keys(codeFiles);
  const activeFile = filenames.includes(selectedFile)
    ? selectedFile
    : filenames[0] || '';

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => {
      abort.current?.abort();
      window.clearTimeout(copyTimer.current);
      if (element.open) element.close();
    };
  }, []);

  function choose(value) {
    setKind(value);
    setFormat(
      { code: 'react', image: 'png', animation: 'gif', project: 'json' }[value],
    );
    setError('');
    if (value === 'animation') setSize(256);
  }

  function close() {
    abort.current?.abort();
    if (dialog.current.open) dialog.current.close();
    onClose();
  }

  async function copyFile() {
    if (!activeFile) return;
    try {
      await copyText(codeFiles[activeFile]);
      setCopiedFile(activeFile);
      notify(`${activeFile} copié.`);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedFile(''), 1600);
    } catch {
      setError(
        'Impossible de copier ce fichier. Vous pouvez sélectionner son contenu.',
      );
    }
  }

  async function download() {
    setError('');
    setBusy(true);
    setProgress(0);
    abort.current = new AbortController();
    try {
      if (configErrors.length)
        throw new Error(
          'Vérifiez le nom du composant et le dossier dans les options avancées.',
        );
      const filename = exportedConfig.slug;
      const transparent = exportedConfig.background.type === 'transparent';
      let blob;
      let extension;
      if (kind === 'code') {
        blob = archive(codeFiles);
        extension = 'zip';
      } else if (kind === 'project') {
        blob = new Blob([JSON.stringify(exportedConfig, null, 2)], {
          type: 'application/json',
        });
        extension = 'json';
      } else if (kind === 'image') {
        extension = format;
        blob =
          format === 'svg'
            ? new Blob(
                [
                  createSvg(exportedConfig, state, {
                    size,
                    transparent,
                  }),
                ],
                { type: 'image/svg+xml' },
              )
            : await exportPng(exportedConfig, state, {
                size,
                transparent,
              });
      } else {
        extension = format === 'gif' ? 'gif' : 'webm';
        blob = await (format === 'gif' ? exportGif : exportVideo)(
          exportedConfig,
          state,
          { size, transparent },
          setProgress,
          abort.current.signal,
        );
      }
      if (abort.current.signal.aborted) return;
      downloadBlob(blob, `${filename}.${extension}`);
      notify(
        kind === 'project'
          ? 'Projet enregistré. Vous pourrez le rouvrir dans Wobbi.'
          : 'Votre mascotte est prête !',
      );
    } catch (caught) {
      if (caught.name !== 'AbortError')
        setError(caught.message || 'L’export a échoué. Vous pouvez réessayer.');
    } finally {
      setBusy(false);
    }
  }

  const formats =
    kind === 'code'
      ? [
          ['react', 'React', '/brand/react.svg'],
          ['vue', 'Vue.js', '/brand/vue.svg'],
          ['javascript', 'JavaScript', '/brand/javascript.svg'],
        ]
      : kind === 'image'
        ? [
            ['png', 'PNG'],
            ['svg', 'SVG'],
          ]
        : [
            ['gif', 'GIF'],
            ['webm', 'Vidéo · WebM'],
          ];
  const deliveryHelp = {
    react:
      'Composant React réutilisable, également compatible avec un composant client Next.js.',
    vue: 'Composant Vue réutilisable et modules associés, prêts à importer dans une application existante.',
    javascript:
      'Démo HTML autonome : ouvrez index.html directement, même sans serveur local.',
  }[format];

  return (
    <dialog
      className="export-dialog"
      ref={dialog}
      aria-labelledby="export-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="export-shell">
        <header className="dialog-heading">
          <div>
            <h2 id="export-title">Exporter votre mascotte</h2>
            <p>Choisissez comment vous voulez l’utiliser.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer l’export"
            onClick={close}
          >
            <X size={21} />
          </button>
        </header>

        <div className="dialog-body">
          <div className="export-kinds">
            {kinds.map(([id, label, help, Icon]) => (
              <button
                type="button"
                key={id}
                className="export-kind"
                aria-pressed={kind === id}
                onClick={() => choose(id)}
                disabled={busy}
              >
                <Icon />
                <span>
                  <strong>{label}</strong>
                  <small>{help}</small>
                </span>
                {kind === id && <Check className="selected-check" />}
              </button>
            ))}
          </div>

          <div className={`export-options ${kind === 'code' ? 'is-code' : ''}`}>
            <div>
              {kind !== 'project' && (
                <>
                  <h2>Format</h2>
                  <div className="format-options">
                    {formats.map(([id, label, icon]) => (
                      <button
                        type="button"
                        key={id}
                        aria-pressed={format === id}
                        disabled={busy || (id === 'webm' && !videoSupported())}
                        onClick={() => setFormat(id)}
                      >
                        {icon && <img src={icon} alt="" aria-hidden="true" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {kind === 'code' ? (
                <>
                  <label>
                    Nom du composant
                    <input
                      value={name}
                      disabled={busy}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={50}
                    />
                  </label>
                  <p className="export-help">{deliveryHelp}</p>
                  <div className="export-advanced">
                    <button
                      type="button"
                      className="export-advanced-trigger"
                      aria-expanded={advanced}
                      aria-controls="export-advanced-options"
                      onClick={() => setAdvanced((value) => !value)}
                    >
                      Options avancées
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                    <DisclosurePanel
                      open={advanced}
                      id="export-advanced-options"
                    >
                      <label>
                        Dossier conseillé
                        <input
                          value={folder}
                          disabled={busy}
                          onChange={(event) => setFolder(event.target.value)}
                        />
                      </label>
                    </DisclosurePanel>
                  </div>
                </>
              ) : kind === 'project' ? (
                <p className="export-help">
                  Conservez les formes, couleurs, accessoires et réactions de
                  votre création pour la reprendre plus tard dans Wobbi.
                </p>
              ) : (
                <>
                  <label>
                    {kind === 'image' ? 'Expression' : 'Réaction à enregistrer'}
                    <select
                      value={state}
                      disabled={busy}
                      onChange={(event) => setState(event.target.value)}
                    >
                      {REACTIONS.map((reaction) => (
                        <option key={reaction} value={reaction}>
                          {reactionLabels[reaction]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Dimensions
                    <select
                      value={size}
                      disabled={busy}
                      onChange={(event) => setSize(Number(event.target.value))}
                    >
                      {(kind === 'animation'
                        ? [256, 512]
                        : [256, 512, 1024]
                      ).map((dimension) => (
                        <option key={dimension} value={dimension}>
                          {dimension} × {dimension} px
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="export-help">
                    {kind === 'image'
                      ? config.background.type === 'transparent'
                        ? 'Le fichier conserve le fond transparent choisi dans le studio.'
                        : 'Le fichier conserve la couleur de fond choisie dans le studio.'
                      : config.background.type === 'transparent'
                        ? 'Séquence de 3,6 secondes sur fond transparent. Le GIF se répète.'
                        : 'Séquence de 3,6 secondes avec le fond du studio. Le GIF se répète.'}
                  </p>
                </>
              )}
            </div>

            {kind !== 'code' && (
              <div
                className={`export-preview ${
                  config.background.type === 'transparent' ? 'checkerboard' : ''
                }`}
                style={{
                  backgroundColor:
                    config.background.type === 'solid'
                      ? config.background.color
                      : undefined,
                }}
              >
                <Mascot
                  config={config}
                  state={state}
                  size={170}
                  playing={kind !== 'image'}
                />
                <p>
                  {kind === 'project'
                    ? 'Votre création, rééditable'
                    : kind === 'image'
                      ? 'La pose sélectionnée'
                      : 'Aperçu de la réaction'}
                </p>
              </div>
            )}
          </div>

          {kind === 'code' && filenames.length > 0 && (
            <section className="code-delivery" aria-label="Code exporté">
              <nav className="code-file-tree" aria-label="Fichiers exportés">
                <h3>Fichiers</h3>
                <ul>
                  {filenames.map((filename) => (
                    <li key={filename}>
                      <button
                        type="button"
                        aria-pressed={activeFile === filename}
                        onClick={() => setSelectedFile(filename)}
                      >
                        <img
                          src={fileIcon(filename)}
                          alt=""
                          aria-hidden="true"
                        />
                        <span>{filename}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="code-preview">
                <div className="code-preview-heading">
                  <strong>{activeFile}</strong>
                  <button
                    type="button"
                    onClick={copyFile}
                    disabled={!activeFile}
                  >
                    {copiedFile === activeFile ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <Copy size={15} aria-hidden="true" />
                    )}
                    {copiedFile === activeFile ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <pre tabIndex="0">
                  <code>{codeFiles[activeFile]}</code>
                </pre>
              </div>
            </section>
          )}

          {error && (
            <p className="export-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="dialog-footer">
          <div className="footer-status">
            {busy && (
              <progress
                className="export-progress"
                aria-label="Progression de l’export"
                value={progress}
                max="1"
              />
            )}
            <span className="dialog-note">Votre création vous appartient.</span>
          </div>
          <button type="button" className="text-button" onClick={close}>
            Annuler
          </button>
          <button
            type="button"
            className="primary"
            disabled={busy}
            onClick={download}
          >
            <Download size={17} />
            {busy
              ? 'Préparation…'
              : {
                  code: 'Télécharger les fichiers',
                  image: 'Télécharger l’image',
                  animation: 'Télécharger l’animation',
                  project: 'Enregistrer le projet',
                }[kind]}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
