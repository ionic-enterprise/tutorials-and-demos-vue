import { useBackendAPI } from '@/composables/backend-api';
import { useVaultFactory } from '@/composables/vault-factory';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';

const { createVault } = useVaultFactory();
const vault = createVault();

const databaseKey = 'database-key';

const getKeyFromBackendAPI = async (): Promise<string | undefined> => {
  const { client } = useBackendAPI();
  const res = await client.get('/keys');
  return res.data && res.data.storage;
};

const getDatabaseKey = async (): Promise<string | void> => {
  let key = await vault.getValue(databaseKey);
  if (!key) {
    key = await getKeyFromBackendAPI();
    vault.setValue(databaseKey, key);
  }
  return key;
};

const initializeEncryption = (): Promise<void> =>
  vault.initialize({
    key: 'io.ionic.csdemosecurestoragekeys',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
    unlockVaultOnLoad: false,
  });

export const useEncryption = () => ({
  getDatabaseKey,
  initializeEncryption,
});
