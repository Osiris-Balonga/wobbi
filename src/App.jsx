import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { FolderOpen, Redo2, RotateCcw, Undo2, Upload } from 'lucide-react';
import { useStudio } from './studio/useStudio.js';
import { CustomizePanel } from './studio/CustomizePanel.jsx';
import { Stage } from './studio/Stage.jsx';
import {
  createConfig,
  PROJECT_VERSION,
  validateConfig,
} from '../packages/core/config.js';
import { reactionDuration } from '../packages/core/motion.js';
import './studio.css';

const loadExportDialog = () => import('./export/ExportDialog.jsx');
const ExportDialog = lazy(() =>
  loadExportDialog().then((module) => ({ default: module.ExportDialog })),
);

export default function App() {
  const studio = useStudio();
  const [details, setDetails] = useState(false),
    [exporting, setExporting] = useState(false);
  const [reaction, setReaction] = useState('idle'),
    [playing, setPlaying] = useState(true),
    [replay, setReplay] = useState(0);
  const [notice, setNotice] = useState('');
  const timers = useRef([]),
    noticeTimer = useRef(null),
    importRef = useRef(null);
  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };
  function clearSequence() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  function reactTo(state) {
    clearSequence();
    setReaction(state);
    setPlaying(true);
    setReplay((n) => n + 1);
    if (state !== 'idle')
      later(() => setReaction('idle'), reactionDuration(state));
  }
  function notify(text) {
    clearTimeout(noticeTimer.current);
    setNotice(text);
    noticeTimer.current = setTimeout(() => setNotice(''), 5000);
  }
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(noticeTimer.current);
    },
    [],
  );
  function patch(changes) {
    clearSequence();
    setReaction('idle');
    studio.patch(changes);
  }
  async function importProject(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1000000)
        throw new Error('Ce fichier est trop volumineux.');
      const input = JSON.parse(await file.text());
      if (
        !input ||
        typeof input !== 'object' ||
        Array.isArray(input) ||
        input.version !== PROJECT_VERSION
      )
        throw new Error('Choisissez un projet Wobbi valide.');
      if (validateConfig(input).length)
        throw new Error('Ce projet contient des valeurs invalides.');
      const config = createConfig(input);
      clearSequence();
      setReaction('idle');
      studio.setConfig(config);
      notify('Votre création est prête.');
    } catch (err) {
      notify(
        err instanceof SyntaxError
          ? 'Ce fichier n’est pas un projet JSON valide.'
          : err.message,
      );
    }
  }
  return (
    <div className="wobbi-app" data-testid="studio">
      <header className="app-header">
        <a
          href="#"
          className="brand-image"
          aria-label="Wobbi — accueil"
          onClick={(e) => {
            e.preventDefault();
            setDetails(false);
          }}
        >
          <img
            src="/brand/wobbi-wordmark.png"
            alt="Wobbi"
            width="188"
            height="70"
          />
        </a>
        <nav aria-label="Actions du studio">
          <button
            className="icon-button"
            aria-label="Annuler la modification"
            disabled={!studio.canUndo}
            onClick={() => {
              clearSequence();
              studio.undo();
            }}
          >
            <Undo2 size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="Rétablir la modification"
            disabled={!studio.canRedo}
            onClick={() => {
              clearSequence();
              studio.redo();
            }}
          >
            <Redo2 size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="Importer un projet"
            title="Importer un projet"
            onClick={() => importRef.current?.click()}
          >
            <FolderOpen size={20} />
          </button>
          <button
            className="icon-button"
            aria-label="Repartir de Wobbi"
            title="Repartir de Wobbi"
            onClick={() => {
              clearSequence();
              setReaction('idle');
              studio.setConfig(createConfig());
              setDetails(false);
              notify('Voici Wobbi, comme dans le logo.');
            }}
          >
            <RotateCcw size={20} />
          </button>
          <button
            className="primary export-button"
            aria-label="Exporter"
            onFocus={loadExportDialog}
            onPointerEnter={loadExportDialog}
            onClick={() => setExporting(true)}
          >
            <Upload size={18} /> <span>Exporter</span>
          </button>
        </nav>
      </header>
      <div className="creation-workspace">
        <CustomizePanel
          config={studio.config}
          patch={patch}
          preview={studio.preview}
          commitPreview={studio.commitPreview}
          details={details}
          setDetails={setDetails}
        />
        <Stage
          config={studio.config}
          reaction={reaction}
          reactTo={reactTo}
          playing={playing}
          setPlaying={setPlaying}
          replay={replay}
        />
      </div>
      <input
        className="sr-only"
        hidden
        type="file"
        ref={importRef}
        accept=".json,application/json"
        aria-label="Importer un projet Wobbi"
        onChange={importProject}
      />
      <Suspense
        fallback={
          <div className="notification visible" role="status">
            Préparation de l’export…
          </div>
        }
      >
        {exporting && (
          <ExportDialog
            config={studio.config}
            onClose={() => setExporting(false)}
            notify={notify}
          />
        )}
      </Suspense>
      <div
        className={
          'notification ' + (notice || studio.storageError ? 'visible' : '')
        }
        role="status"
      >
        {notice || studio.storageError}
      </div>
    </div>
  );
}
