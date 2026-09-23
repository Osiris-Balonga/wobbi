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
import { catalog } from '../studio/catalog.js';
import { useLocale } from '../i18n/index.js';
import { downloadBlob } from './download.js';
import {
  createSvg,
  exportGif,
  exportPng,
  exportVideo,
  videoSupported,
} from './media.js';

const kinds = [
  ['code', 'Website or app', 'An interactive mascot', Code2],
  ['image', 'Image', 'PNG or SVG', Image],
  ['animation', 'Animation', 'GIF or video', Play],
  ['project', 'Wobbi project', 'Edit it again later', FilePenLine],
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
    : 'My' + (normalized || 'Wobbi');
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
  const { locale, t } = useLocale();
  const { reactionLabels } = catalog(locale);
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
        accessibility: {
          ...config.accessibility,
          label: ['Wobbi mascot', 'Mascotte Wobbi'].includes(
            config.accessibility.label,
          )
            ? locale === 'fr'
              ? 'Mascotte Wobbi'
              : 'Wobbi mascot'
            : config.accessibility.label,
        },
      }),
    [config, folder, format, name, locale],
  );
  const configErrors = validateConfig(exportedConfig);
  const codeFiles = useMemo(() => {
    if (kind !== 'code' || configErrors.length) return {};
    if (format === 'javascript')
      return generateVanillaFiles(exportedConfig, locale);
    if (format === 'vue') return generateVueFiles(exportedConfig);
    return generateFiles(exportedConfig);
  }, [exportedConfig, format, kind, configErrors.length, locale]);
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
      notify(t('{file} copied.', { file: activeFile }));
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedFile(''), 1600);
    } catch {
      setError(t('Could not copy this file. You can select its contents.'));
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
          t('Check the component name and folder in advanced options.'),
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
          ? t('Project saved. You can reopen it in Wobbi.')
          : t('Your mascot is ready!'),
      );
    } catch (caught) {
      if (caught.name !== 'AbortError')
        setError(t(caught.message || 'Export failed. Please try again.'));
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
            ['webm', t('Video · WebM')],
          ];
  const deliveryHelp = {
    react: t(
      'Reusable React component, also compatible with Next.js client components.',
    ),
    vue: t(
      'Reusable Vue component and modules, ready to import into an existing app.',
    ),
    javascript: t(
      'Standalone HTML demo: open index.html directly, without a local server.',
    ),
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
            <h2 id="export-title">{t('Export your mascot')}</h2>
            <p>{t('Choose how you want to use it.')}</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={t('Close export dialog')}
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
                  <strong>{t(label)}</strong>
                  <small>{t(help)}</small>
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
                    {t('Component name')}
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
                      {t('Advanced options')}
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                    <DisclosurePanel
                      open={advanced}
                      id="export-advanced-options"
                    >
                      <label>
                        {t('Suggested folder')}
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
                  {t(
                    'Save the shapes, colors, accessories, and reactions of your creation to continue editing it in Wobbi later.',
                  )}
                </p>
              ) : (
                <>
                  <label>
                    {kind === 'image'
                      ? t('Expression')
                      : t('Reaction to record')}
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
                        ? t(
                            'The file keeps the transparent background selected in the studio.',
                          )
                        : t(
                            'The file keeps the background color selected in the studio.',
                          )
                      : config.background.type === 'transparent'
                        ? t(
                            'A 3.6-second sequence on a transparent background. The GIF loops.',
                          )
                        : t(
                            'A 3.6-second sequence with the studio background. The GIF loops.',
                          )}
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
                    ? t('Your editable creation')
                    : kind === 'image'
                      ? t('Selected pose')
                      : t('Reaction preview')}
                </p>
              </div>
            )}
          </div>

          {kind === 'code' && filenames.length > 0 && (
            <section className="code-delivery" aria-label={t('Exported code')}>
              <nav className="code-file-tree" aria-label={t('Exported files')}>
                <h3>{t('Files')}</h3>
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
                    {copiedFile === activeFile ? t('Copied') : t('Copy')}
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
                aria-label={t('Export progress')}
                value={progress}
                max="1"
              />
            )}
            <span className="dialog-note">
              {t('Your creation belongs to you.')}
            </span>
          </div>
          <button type="button" className="text-button" onClick={close}>
            {t('Cancel')}
          </button>
          <button
            type="button"
            className="primary"
            disabled={busy}
            onClick={download}
          >
            <Download size={17} />
            {busy
              ? t('Preparing…')
              : {
                  code: t('Download files'),
                  image: t('Download image'),
                  animation: t('Download animation'),
                  project: t('Save project'),
                }[kind]}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
