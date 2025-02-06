import { useEncryptionKeys } from '@/composables/encryption-keys';
import { DbTransaction, SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite';
import { isPlatform } from '@ionic/vue';

let handle: SQLiteObject | null = null;

const openDatabase = async (): Promise<SQLiteObject | null> => {
  if (isPlatform('hybrid')) {
    const { getDatabaseKey } = useEncryptionKeys();
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

const createTables = (transaction: DbTransaction): void => {
  transaction.executeSql(
    'CREATE TABLE IF NOT EXISTS KeyValuePairs (id TEXT, collection TEXT, value TEXT, PRIMARY KEY (id, collection))',
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
