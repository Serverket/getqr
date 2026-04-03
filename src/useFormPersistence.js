import { useCallback } from 'react';

const DB_NAME = 'getqr-persistence';
const DB_VERSION = 2;
const STORE_NAME = 'form-data';

// Open (or create) the IndexedDB database
const openDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Recreate store with session-scoped key schema
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// Save form data for a session-scoped key
const saveTabData = async (id, data) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, data, savedAt: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('IndexedDB save failed:', error);
  }
};

// Load saved form data for a session-scoped key
const loadTabData = async (id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB load failed:', error);
    return null;
  }
};

// Clear saved form data for a session-scoped key
const clearTabData = async (id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('IndexedDB clear failed:', error);
  }
};

// React hook — session-scoped save/load/clear callbacks
const useFormPersistence = (sessionId) => {
  const makeKey = useCallback((tab) => `${sessionId}:${tab}`, [sessionId]);
  const save = useCallback((tab, data) => saveTabData(makeKey(tab), data), [makeKey]);
  const load = useCallback((tab) => loadTabData(makeKey(tab)), [makeKey]);
  const clear = useCallback((tab) => clearTabData(makeKey(tab)), [makeKey]);

  return { save, load, clear };
};

export default useFormPersistence;
