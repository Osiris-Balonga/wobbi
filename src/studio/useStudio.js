import { useRef, useState } from 'react';
import { createConfig, validateConfig } from '../../packages/core/config.js';
const KEY = 'wobbi.studio.v2';
function restore() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored?.config && !validateConfig(stored.config).length)
      return createConfig(stored.config);
  } catch {
    return createConfig();
  }
  return createConfig();
}
export function useStudio() {
  const initialHistory = {
    past: [],
    config: restore(),
    future: [],
  };
  const [history, setHistory] = useState(initialHistory);
  const historyRef = useRef(initialHistory);
  const transientBase = useRef(null);
  const [storageError, setStorageError] = useState('');
  function commit(next) {
    historyRef.current = next;
    setHistory(next);
    try {
      localStorage.setItem(KEY, JSON.stringify({ config: next.config }));
      setStorageError('');
    } catch {
      setStorageError(
        'Enregistrement local indisponible. Exportez le projet pour le conserver.',
      );
    }
  }
  function setConfig(config) {
    transientBase.current = null;
    const current = historyRef.current;
    commit({
      past: [...current.past.slice(-39), current.config],
      config: createConfig(config),
      future: [],
    });
  }
  function preview(changes) {
    const current = historyRef.current;
    transientBase.current ??= current.config;
    const next = {
      ...current,
      config: createConfig({ ...current.config, ...changes }),
    };
    historyRef.current = next;
    setHistory(next);
  }
  function commitPreview() {
    if (!transientBase.current) return;
    const current = historyRef.current;
    const next = {
      past: [...current.past.slice(-39), transientBase.current],
      config: current.config,
      future: [],
    };
    transientBase.current = null;
    commit(next);
  }
  return {
    config: history.config,
    setConfig,
    patch: (changes) => setConfig({ ...historyRef.current.config, ...changes }),
    preview,
    commitPreview,
    storageError,
    undo: () => {
      const current = historyRef.current;
      transientBase.current = null;
      if (current.past.length)
        commit({
          past: current.past.slice(0, -1),
          config: current.past.at(-1),
          future: [current.config, ...current.future],
        });
    },
    redo: () => {
      const current = historyRef.current;
      transientBase.current = null;
      if (current.future.length)
        commit({
          past: [...current.past, current.config],
          config: current.future[0],
          future: current.future.slice(1),
        });
    },
    canUndo: !!history.past.length,
    canRedo: !!history.future.length,
  };
}
