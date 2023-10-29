import { useEncryption } from '@/composables/encryption';
import { Capacitor } from '@capacitor/core';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage';

const storage = new KeyValueStorage();
let initialized = false;

const isReady = async (): Promise<boolean> => {
  if (!initialized) {
    const { getDatabaseKey } = useEncryption();
    const key = Capacitor.isNativePlatform() ? await getDatabaseKey() : '';
    await storage.create(key || '');
    initialized = true;
  }
  return initialized;
};

const getValue = async (key: string): Promise<any> => {
  if (await isReady()) {
    return storage.get(key);
  }
};

const setValue = async (key: string, value: any): Promise<void> => {
  if (await isReady()) {
    await storage.set(key, value);
  }
};

export const useStorage = () => ({
  getValue,
  setValue,
});
