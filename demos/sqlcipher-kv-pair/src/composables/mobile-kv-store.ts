import { useDatabase } from './database';

const { getHandle } = useDatabase();

const initialize = (): Promise<void> => {
  return Promise.resolve();
};

const clear = async (): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) => {
      tx.executeSql('DELETE FROM KeyValuePairs', undefined, () => {});
    });
  }
};

const getAll = async (): Promise<{ key: any; value: any }[]> => {
  const kvPairs: { key: any; value: any }[] = [];
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) =>
      tx.executeSql(`SELECT id, value FROM KeyValuePairs ORDER BY id`, undefined, (_t: any, r: any) => {
        for (let i = 0; i < r.rows.length; i++) {
          const { id, value } = r.rows.item(i);
          kvPairs.push({ key: JSON.parse(id), value: JSON.parse(value) });
        }
      }),
    );
  }
  return kvPairs;
};

const getValue = async (key: any): Promise<any | undefined> => {
  let value: any = undefined;
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) =>
      tx.executeSql(`SELECT value FROM KeyValuePairs WHERE id = ?`, [JSON.stringify(key)], (_t: any, r: any) => {
        if (r.rows.length) {
          value = JSON.parse(r.rows.item(0).value);
        }
      }),
    );
  }
  return value;
};

const removeValue = async (key: any): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) => {
      tx.executeSql('DELETE FROM KeyValuePairs WHERE id = ?', [JSON.stringify(key)], () => {});
    });
  }
};

const setValue = async (key: any, value: any): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO KeyValuePairs (id, value) VALUES (?, ?)' +
          ' ON CONFLICT(id) DO' +
          ' UPDATE SET value = ?' +
          ' WHERE id = ?',
        [JSON.stringify(key), JSON.stringify(value), JSON.stringify(value), JSON.stringify(key)],
        () => {},
      );
    });
  }
};

const getKeys = async (): Promise<any[]> => {
  const keys: { key: any; value: any }[] = [];
  const handle = await getHandle();
  if (handle) {
    await handle.transaction((tx) =>
      tx.executeSql(`SELECT id FROM KeyValuePairs ORDER BY id`, undefined, (_t: any, r: any) => {
        for (let i = 0; i < r.rows.length; i++) {
          const { id } = r.rows.item(i);
          keys.push(JSON.parse(id));
        }
      }),
    );
  }
  return keys;
};

export const useMobileKVStore = () => ({ initialize, clear, getAll, getKeys, getValue, removeValue, setValue });
