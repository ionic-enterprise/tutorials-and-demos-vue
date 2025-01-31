import { useKeys } from '@/composables/keys';
import { DbTransaction, SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite';
import { isPlatform } from '@ionic/vue';

interface Column {
  name: string;
  type: string;
}

let handle: SQLiteObject | null = null;

const openDatabase = async (): Promise<SQLiteObject | null> => {
  if (isPlatform('hybrid')) {
    const { getDatabaseKey } = useKeys();
    const key = getDatabaseKey();
    if (key) {
      return SQLite.create({
        name: 'emailcache.db',
        location: 'default',
        key,
      });
    }
  }
  return null;
};

const createTableSQL = (name: string, columns: Array<Column>): string => {
  let cols = '';
  columns.forEach((c, i) => {
    cols += `${i ? ', ' : ''}${c.name} ${c.type}`;
  });
  return `CREATE TABLE IF NOT EXISTS ${name} (${cols})`;
};

const createTables = (transaction: DbTransaction): void => {
  transaction.executeSql(
    createTableSQL('KeyValuePairs', [
      { name: 'id', type: 'TEXT PRIMARY KEY' },
      { name: 'value', type: 'TEXT' },
    ]),
  );
};

const getHandle = async (): Promise<SQLiteObject | null> => {
  if (!handle) {
    handle = await openDatabase();
    if (handle) {
      handle.transaction((tx: DbTransaction) => createTables(tx));
    }
  }
  return handle;
};

export const useDatabase = () => ({
  getHandle,
});
