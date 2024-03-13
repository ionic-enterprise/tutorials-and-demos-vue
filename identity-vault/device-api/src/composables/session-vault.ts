import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BiometricPermissionState,
  BrowserVault,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { ref } from 'vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  try {
    await vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.InMemory,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 30000,
    });
  } catch (e: unknown) {
    await vault.clear();
    await updateUnlockMode('InMemory');
  }

  vault.onLock(() => (session.value = null));
};

const enhanceVault = async (): Promise<void> => {
  if (await Device.isSystemPasscodeSet()) {
    await updateUnlockMode('BiometricsWithPasscode');
  } else {
    await updateUnlockMode('InMemory');
  }
};

const storeSession = async (s: Session): Promise<void> => {
  vault.setValue('session', s);
  session.value = s;
};

const getSession = async (): Promise<void> => {
  if (await vault.isEmpty()) {
    session.value = null;
  } else {
    session.value = await vault.getValue<Session>('session');
  }
};

const clearSession = async (): Promise<void> => {
  await vault.clear();
  session.value = null;
};

const lockSession = async (): Promise<void> => {
  await vault.lock();
  session.value = null;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue<Session>('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  return (
    vault.config?.type !== VaultType.SecureStorage &&
    vault.config?.type !== VaultType.InMemory &&
    !(await vault.isEmpty()) &&
    (await vault.isLocked())
  );
};

const updateUnlockMode = async (mode: UnlockMode): Promise<void> => {
  const type = await getVaultType(mode);
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  const lockAfterBackgrounded = type === VaultType.InMemory ? 30000 : 2000;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
    lockAfterBackgrounded,
  });
};

const getVaultType = async (mode: UnlockMode): Promise<VaultType> => {
  if (mode === 'BiometricsWithPasscode') {
    await provisionBiometrics();
    return (await Device.isBiometricsEnabled()) &&
      (await Device.isBiometricsAllowed()) !== BiometricPermissionState.Granted
      ? VaultType.InMemory
      : VaultType.DeviceSecurity;
  }

  return mode === 'InMemory' ? VaultType.InMemory : VaultType.SecureStorage;
};

const provisionBiometrics = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

export const useSessionVault = (): any => ({
  clearSession,
  enhanceVault,
  getSession,
  initializeVault,
  lockSession,
  session,
  sessionIsLocked,
  storeSession,
  unlockSession,
  updateUnlockMode,
});
