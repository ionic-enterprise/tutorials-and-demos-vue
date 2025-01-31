let db: IDBDatabase | null = null;

const initialize = (): Promise<void> => {
  const name = 'web-kv-store';

  const request = indexedDB.open(name, 1);

  request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    db = (event as any).target.result as IDBDatabase;
    db.onerror = (evt: unknown) => console.error('Error in indexDB KV store', evt);
    db.createObjectStore('data', { keyPath: 'key' });
  };

  return new Promise((resolve, reject) => {
    request.onerror = (evt: unknown) => reject(evt);
    request.onsuccess = (evt: any) => {
      db = evt.target.result as IDBDatabase;
      resolve();
    };
  });
};

const clear = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!db) return resolve();
    const dataObjectStore = db.transaction('data', 'readwrite').objectStore('data');
    const req = dataObjectStore.clear();
    req.onsuccess = () => resolve();
  });
};

const getAll = (): Promise<{ key: any; value: any }[]> => {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    const dataObjectStore = db.transaction('data', 'readonly').objectStore('data');
    const req = dataObjectStore.getAll();
    req.onsuccess = (evt: any) => resolve(evt.target.result || []);
  });
};

const getValue = (key: any): Promise<any | undefined> => {
  return new Promise((resolve) => {
    if (!db) return resolve(undefined);
    const dataObjectStore = db.transaction('data', 'readonly').objectStore('data');
    const req = dataObjectStore.get(key);
    req.onsuccess = (evt: any) => resolve(evt.target.result?.value);
  });
};

const removeValue = (key: any): Promise<void> => {
  return new Promise((resolve) => {
    if (!db) return resolve();
    const dataObjectStore = db.transaction('data', 'readwrite').objectStore('data');
    const req = dataObjectStore.delete(key);
    req.onsuccess = () => resolve();
  });
};

const setValue = (key: any, value: any): Promise<void> => {
  return new Promise((resolve) => {
    if (!db) return resolve();
    const dataObjectStore = db.transaction('data', 'readwrite').objectStore('data');
    const req = dataObjectStore.put({ key, value });
    req.onsuccess = () => resolve();
  });
};

const getKeys = (): Promise<any[]> => {
  return new Promise((resolve) => {
    if (!db) return resolve([]);
    const dataObjectStore = db.transaction('data', 'readonly').objectStore('data');
    const req = dataObjectStore.getAllKeys();
    req.onsuccess = (evt: any) => resolve(evt.target.result);
  });
};

export const useWebKVStore = () => ({ initialize, clear, getAll, getKeys, getValue, removeValue, setValue });
