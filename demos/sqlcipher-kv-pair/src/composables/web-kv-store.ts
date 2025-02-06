import { KeyValuePair, KeyValueKey, KeyValueCollection } from './kv-types';

let db: IDBDatabase | null = null;

const initialize = (): Promise<void> => {
  const name = 'web-kv-store';

  const request = indexedDB.open(name, 1);

  request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    db = (event as any).target.result as IDBDatabase;
    db.onerror = (evt: unknown) => console.error('Error in indexDB KV store', evt);
    db.createObjectStore('inbox', { keyPath: 'key' });
  };

  return new Promise((resolve, reject) => {
    request.onerror = (evt: unknown) => reject(evt);
    request.onsuccess = (evt: any) => {
      db = evt.target.result as IDBDatabase;
      resolve();
    };
  });
};

export const useWebKVStore = (collection: KeyValueCollection) => {
  const clear = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!db) return resolve();
      const dataObjectStore = db.transaction(collection, 'readwrite').objectStore(collection);
      const req = dataObjectStore.clear();
      req.onsuccess = () => resolve();
    });
  };

  const getAll = (): Promise<KeyValuePair[]> => {
    return new Promise((resolve) => {
      if (!db) return resolve([]);
      const dataObjectStore = db.transaction(collection, 'readonly').objectStore(collection);
      const req = dataObjectStore.getAll();
      req.onsuccess = (evt: any) => resolve(evt.target.result || []);
    });
  };

  const getValue = (key: KeyValueKey): Promise<any | undefined> => {
    return new Promise((resolve) => {
      if (!db) return resolve(undefined);
      const dataObjectStore = db.transaction(collection, 'readonly').objectStore(collection);
      const req = dataObjectStore.get(key);
      req.onsuccess = (evt: any) => resolve(evt.target.result?.value);
    });
  };

  const removeValue = (key: KeyValueKey): Promise<void> => {
    return new Promise((resolve) => {
      if (!db) return resolve();
      const dataObjectStore = db.transaction(collection, 'readwrite').objectStore(collection);
      const req = dataObjectStore.delete(key);
      req.onsuccess = () => resolve();
    });
  };

  const setValue = (key: KeyValueKey, value: any): Promise<void> => {
    return new Promise((resolve) => {
      if (!db) return resolve();
      const dataObjectStore = db.transaction(collection, 'readwrite').objectStore(collection);
      const req = dataObjectStore.put({ key, value });
      req.onsuccess = () => resolve();
    });
  };

  const getKeys = (): Promise<KeyValueKey[]> => {
    return new Promise((resolve) => {
      if (!db) return resolve([]);
      const dataObjectStore = db.transaction(collection, 'readonly').objectStore(collection);
      const req = dataObjectStore.getAllKeys();
      req.onsuccess = (evt: any) => resolve(evt.target.result);
    });
  };

  return { initialize, clear, getAll, getKeys, getValue, removeValue, setValue };
};
