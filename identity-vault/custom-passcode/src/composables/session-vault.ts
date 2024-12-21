import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import {
  BrowserVault,
  DeviceSecurityType,
  IdentityVaultConfig,
  Vault,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { modalController } from '@ionic/vue';
import { ref } from 'vue';
import AppPinDialog from '@/components/AppPinDialog.vue';

export type UnlockMode = 'BiometricsWithPasscode' | 'CustomPasscode' | 'InMemory' | 'SecureStorage';

const { createVault } = useVaultFactory();
const vault: Vault | BrowserVault = createVault();
const session = ref<Session | null>(null);

const initializeVault = async (): Promise<void> => {
  try {
    await vault.initialize({
      key: 'io.ionic.gettingstartediv',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 2000,
    });
  } catch {
    await vault.clear();
    await updateUnlockMode('SecureStorage');
  }

  vault.onLock(() => (session.value = null));

  vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
    const modal = await modalController.create({
      component: AppPinDialog,
      backdropDismiss: false,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    await vault.setCustomPasscode(data || '');
  });
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
  const type =
    mode === 'BiometricsWithPasscode'
      ? VaultType.DeviceSecurity
      : mode === 'CustomPasscode'
        ? VaultType.CustomPasscode
        : mode === 'InMemory'
          ? VaultType.InMemory
          : VaultType.SecureStorage;
  const deviceSecurityType = type === VaultType.DeviceSecurity ? DeviceSecurityType.Both : DeviceSecurityType.None;
  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const useSessionVault = (): any => ({
  clearSession,
  getSession,
  initializeVault,
  lockSession,
  session,
  sessionIsLocked,
  storeSession,
  unlockSession,
  updateUnlockMode,
});
