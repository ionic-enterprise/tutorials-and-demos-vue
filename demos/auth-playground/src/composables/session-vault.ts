import {
  BiometricPermissionState,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { useVaultFactory } from '@/composables/vault-factory';
import { isPlatform, modalController } from '@ionic/vue';
import AppPinDialog from '@/components/AppPinDialog.vue';
import { Preferences } from '@capacitor/preferences';
import router from '@/router';

export type UnlockMode = 'Device' | 'SystemPIN' | 'SessionPIN' | 'NeverLock' | 'ForceLogin';

const modeKey = 'LastUnlockMode';

const { createVault } = useVaultFactory();

const vault = createVault({
  key: 'io.ionic.auth-playground-vue',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 5000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
});

vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
  const modal = await modalController.create({
    backdropDismiss: false,
    component: AppPinDialog,
    componentProps: {
      setPasscodeMode: isPasscodeSetRequest,
    },
  });
  await modal.present();
  const { data } = await modal.onDidDismiss();
  vault.setCustomPasscode(data || '');
});

vault.onLock(() => {
  router.replace('/unlock');
});

const provision = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch (error) {
      null;
    }
  }
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Device':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Both;
      break;

    case 'SystemPIN':
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.SystemPasscode;
      break;

    case 'SessionPIN':
      type = VaultType.CustomPasscode;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'ForceLogin':
      type = VaultType.InMemory;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'NeverLock':
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    default:
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
  }

  await vault.updateConfig({
    ...vault.config,
    type,
    deviceSecurityType,
  });
  await Preferences.set({ key: modeKey, value: unlockMode });
};

const initializeUnlockMode = async (): Promise<void> => {
  if (isPlatform('hybrid')) {
    if (await Device.isSystemPasscodeSet()) {
      if (await Device.isBiometricsEnabled()) {
        await setUnlockMode('Device');
      } else {
        await setUnlockMode('SystemPIN');
      }
    } else {
      await setUnlockMode('SessionPIN');
    }
  } else {
    await setUnlockMode('NeverLock');
  }
};

const canUnlock = async (): Promise<boolean> => {
  const { value } = await Preferences.get({ key: modeKey });
  return value !== 'NeverLock' && !(await vault.isEmpty()) && (await vault.isLocked());
};

const getConfig = (): IdentityVaultConfig => vault.config;
const getKeys = async (): Promise<Array<string>> => vault.getKeys();

const getValue = async <T>(key: string): Promise<T | undefined> => vault.getValue(key);
const setValue = async <T>(key: string, value: T): Promise<void> => vault.setValue(key, value);
const clear = async (): Promise<void> => vault.clear();

const lock = async (): Promise<void> => vault.lock();
const unlock = async (): Promise<void> => vault.unlock();

export const useSessionVault = () => ({
  canUnlock,
  initializeUnlockMode,
  setUnlockMode,

  getConfig,
  getKeys,

  getValue,
  setValue,
  clear,

  lock,
  unlock,
});
