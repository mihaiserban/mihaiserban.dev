import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'patternGenerator';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readPersisted = (key, defaults) => {
  if (!isBrowser()) return defaults;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    return { ...defaults, ...parsed };
  } catch (err) {
    console.warn(`Failed to read persisted settings for ${key}:`, err);
    return defaults;
  }
};

export const buildStorageKey = (name) => `${STORAGE_PREFIX}.${name}`;

export const clearPersistedSettings = (name) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(buildStorageKey(name));
  } catch (err) {
    console.warn(`Failed to clear persisted settings for ${name}:`, err);
  }
};

export const usePersistedSettings = (defaults, name = 'settings.v1') => {
  const key = buildStorageKey(name);
  const [settings, setSettings] = useState(() => readPersisted(key, defaults));

  useEffect(() => {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(settings));
    } catch (err) {
      console.warn(`Failed to persist settings for ${key}:`, err);
    }
  }, [key, settings]);

  const reset = useCallback(() => {
    setSettings(defaults);
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`Failed to clear persisted settings for ${key}:`, err);
      }
    }
  }, [defaults, key]);

  return [settings, setSettings, reset];
};

export default usePersistedSettings;
