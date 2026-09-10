import { useState } from 'react';
import { createConfig, validateConfig } from '../../packages/core/config.js';
const KEY = 'wobbi.studio.v1';
function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.config) {
      const config = createConfig(saved.config);
      if (!validateConfig(config).length)
        return { config, theme: saved.theme === 'dark' ? 'dark' : 'light' };
    }
  } catch {
    /* Invalid or unavailable browser storage falls back to a fresh mascot. */
  }
  return { config: createConfig(), theme: 'light' };
}
export function useStudio() {
  const [saved, setSaved] = useState(restore);
  const [storageError, setStorageError] = useState('');
  function commit(next) {
    setSaved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setStorageError('');
    } catch {
      setStorageError(
        'Browser storage is unavailable. Download your mascot to keep a copy.',
      );
    }
  }
  const setConfig = (config) => commit({ ...saved, config });
  const setTheme = (theme) => commit({ ...saved, theme });
  const patch = (changes) =>
    setConfig(createConfig({ ...saved.config, ...changes }));
  return { ...saved, setConfig, patch, setTheme, storageError };
}
